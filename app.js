const express = require("express");
const app=express();
const port= process.env.PORT || 2000;
const path =require("path");
const ejs = require("ejs");
require("./db/conn1");
const ejsdata = require("./models/rj");
const Comment = require("./models/comment");
const Register  = require("./models/registers");
const feed  = require("./models/feed");
const multer = require('multer');
const bodyparse =require("body-parser");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
var session = require("express-session");
var morgan = require("morgan");
var dateFormat = require('dateformat');

var Filter = require('bad-words'); 
var filter = new Filter(); 


// filter.addWords('bad', 'dumb');
const words= require("./badword.json");
filter.addWords(...words);




app.use(morgan("dev"));
const jwt = require('jsonwebtoken');
const { isValidObjectId } = require("mongoose");
app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({extended:false}));
const static_path = path.join(__dirname,"./public");
app.set("view engine",ejs);
app.use(express.static(static_path));
app.use(bodyparse.urlencoded({extended:true}));


const auth = async(req,res,next)=>{
  try{
      const token =req.cookies.jwt;
      const verifyUser = jwt.verify(token,"mynameisjaypatelandyournameiswhatandyou");
      // console.log(verifyUser);

      const user = await Register.findOne({_id:verifyUser._id});
      // console.log(user);
      next();

      req.token=token;
      req.user = user;

   
  }
  catch(error){
      res.render("login.ejs");
  }

}

app.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000,
    },
  })
);
  

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});

app.use((req, res, next)=>{
  res.locals.user = req.session.user;
  // delete req.session.user
  next();
});


  
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect("/main");
  } else {
    next();
  }
};



app.use( express.static( "views" ) );
const base_path = path.join(__dirname,"./");
app.use(express.static(base_path));
app.use('/css',express.static(__dirname + './public/css'));
app.use('/uploads',express.static(__dirname + './public/uploads'));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/uploads');
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname+"_"+Date.now() + file.originalname);
    }
  });
  
  const upload = multer({
    storage: storage,
  }).single('myImage');
  


app.get("/covid19", async (req,res)=>{
    res.render("covid19.ejs");
})
app.get("/prevention", async (req,res)=>{
    res.render("prevention.ejs");
})
app.get("/about", async (req,res)=>{
    res.render("about.ejs");
})
app.post("/about", async (req,res)=>{
  try{
    var names=req.body.name;
    var emails=req.body.email;
    if(!names ==" " && !emails==" "){

      const feeds = new feed({
          name:names,
          email:emails
      })
      const feeded =  feeds.save();
      console.log("all donme");
      res.redirect("/main");
    }
    else{
      res.redirect("/about");
    }
}
catch(error){
res.status(400).send(error);
}
})


app.get("/fpass1", async (req,res)=>{
  res.render("fpass1.ejs");
})
app.post("/fpass1", async (req,res)=>{
  try{
    const email = req.body.email;
   
    const useremail = await Register.findOne({email:email});

   if(useremail){
    //  req.session.user=useremail;
    res.render("fpass1.ejs");
     } 
    else{
        
           res.redirect("/login");
   }
 }
 
 catch(error){
   res.redirect("/login");
 }
});




    

  
  app.get("/index",function(req,res){
      ejsdata.find(function(err, users){
          if(!err){
              res.render("index.ejs",{users:users })
              // console.log(users);
          }
          else{
              console.log("sory");
          }
      })
  })  
  
  app.post("/index",function(req,res){
    
    ejsdata.find(function(err, users){
  
      if(!err){
          res.render("index.ejs",{users:users })
          // console.log(users);
      }
      else{
          console.log("sory");
      }
  })
  })
  
  
  
  
  app.get("/new-post",auth,(req,res)=>{
      res.render("new-post.ejs");
  })
  
  app.post("/new-post",upload,function(req,res){
    try{

          titles=filter.clean(req.body.title);
      contents=filter.clean(req.body.content);
      // var dated = new Date().toLocaleString();
      var dated=dateFormat(new Date(), "dddd dd-mm-yyyy");
             const blog = new ejsdata({
                 title:titles,
                //  title:req.body.title,
                 content:contents,
                //  content:req.body.content,
                 myImage:req.file.filename,
                 Date:dated,

             })
             console.log(req.file.filename);
             const bloged =  blog.save();
             console.log("all donme");
             res.redirect("/index");
     }
    catch(error){
     res.status(400).send(error);
    }
  })


  

  app.post("/comment",async(req,res)=>{
    try{
         
          const id= req.body.post_id;
          const jp=await ejsdata.findByIdAndUpdate(id,
            {$push:{ 
               name:req.body.name,
               comment:req.body.comment}},{
                  new:true
                });
                const dj=await jp.save(); 
                // res.send(jp);
                res.redirect(`/post/${id}`);
                
                
                // req.session.user =dj;
                // console.log("hi",req.session.user);
                
                // const i=req.session.user.post_id;
                // const n =req.session.user.names;
                // var us =req.session.user.comment; 
                // const pp=[];
                // pp.push(us);
                // console.log(pp);
              // res.send(jp);
                // res.redirect('/home');


       }
    catch(error){
      res.redirect(`/index`);
    
    }
  })
  
  
  
  
  
  
  app.get("/post/:id", function(req,res){
     ejsdata.findById(req.params.id,function(err,users){
        if(!err){
          res.render("post.ejs",{users:users});
        }
      });
  
      
  });
 
  
  
  
  
  app.get("/",(req,res)=>{
    res.render("mains.ejs");
  })
  app.get("/main",(req,res)=>{
    res.render("main.ejs");
  })
  app.post("/main", async (req,res)=>{
    try{
          const email = req.body.email;
          const password = req.body.password;
          const newpassword = req.body.newpassword;
           const cpassword = req.body.cpassword;
          const useremail = await Register.findOne({email:email})
          
          const isMatch = await bcrypt.compare(password,useremail.password);
   
          const token = await useremail.generateAuthToken();
   
          res.cookie("jwt",token,{
             expires:new Date(Date.now() +500000),
             httpOnly:true
   
         });
         if(isMatch){
           console.log("hellp");
          req.session.user=useremail;
          var hash = req.session.user.password;
          console.log(hash);
            if(newpassword == cpassword){
              bcrypt.hash(newpassword,10,function(err,hash){
                req.session.user.password = hash;
                // console.log(req.session.user.password);
                req.session.user.save();
                // console.log(req.session.user);
                const all = Register.update({email:req.session.user.email},{password:req.session.user.password});
              
                console.log("done baby");
                // console.log(all);
              
               res.redirect("/main");
              }) 

           }
          }
       else{
            
                 res.redirect("/fpass1");
         }
       }
       
       catch(error){
         res.redirect("/fpass1");
       }
     });
   
     
  

    

  app.get("/register", async (req,res)=>{
        res.render("indexp.ejs");
  })
  
  
  app.post("/register", async (req,res)=>{
    try{

      const password = req.body.password;
       const cpassword = req.body.Confirmpassword;
       if(password === cpassword){ 
        const passwords = await bcrypt.hash(password,10);    
        const cpasswords = await bcrypt.hash(cpassword,10);    
             const registeremployee = new Register({
                 firstname:req.body.firstname,
                 email:req.body.email,
                 password:passwords,
                 Confirmpassword:cpasswords
             })
            
             const token = await registeremployee.generateAuthToken();
          
            res.cookie("jwt",token,{
                expires:new Date(Date.now() +500000),
                httpOnly:true
            });
      
             const registed=await registeremployee.save();
             req.session.user=registed;
             res.render("login.ejs");
         }
         else{
             res.redirect("/register");
         }
    }
    catch(error){
     res.render("indexp.ejs");
    }
  })




  app.get("/login" ,(req,res)=>{
  
        res.render("login.ejs");
  
      
  });

  // app.get("/login",sessionChecker, async (req,res)=>{
  //   Register.findById(req.params.id,function(err,users){
  //     if(!err){
  //       res.render("login.ejs",{users:users});
  //     }
  //   });
      
  // })
  
  app.post("/login", async (req,res)=>{
   try{
         const email = req.body.email;
         const password = req.body.password;


         const useremail = await Register.findOne({email:email})
        //  console.log(useremail);
         const isMatch = await bcrypt.compare(password,useremail.password);
        //  console.log(isMatch);
         const token = await useremail.generateAuthToken();
  
         res.cookie("jwt",token,{
            expires:new Date(Date.now() +500000),
            httpOnly:true
  
        });
        if(isMatch){
          req.session.user = isMatch;
          if(req.session.user == true){
            req.session.user = useremail
              res.redirect("/main");
          }
         }   
      else{
              //    req.session.user = {
              //   intro:'PLZ enter valid email and password'
              // }
                res.redirect("/login");
        }
      }
      
      catch(error){
        res.redirect("/login");
      }
    });
  
    
   
  app.get("/logout",async(req,res)=>{
    try{
        req.session.destroy();
        res.clearCookie("jwt");
        console.log("done logout"); 
        res.redirect("/main");
    }
    catch(error){
        res.status(500).send(error);
    }
    
  })
  
  
  

app.listen(port,()=>{
    console.log(`connection is done ${port}`);
})