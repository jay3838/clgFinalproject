const mongoose  = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


const employeeSchema = new  mongoose.Schema({
    firstname:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true

    },
    password:{
        type:String,
        require:true
  
    },
    Confirmpassword:{
        type:String,
        require:true
    },
    tokens:[{
        token:{
            type:String,
            require:true  
        }
    }]

}) 


employeeSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()},"mynameisjaypatelandyournameiswhatandyou")
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    }
    catch(error){
        res.status(400).send(error);
    }
}

// employeeSchema.pre("save", async function(next){

//     if(this.isModified('password')){
//         // console.log(`password ${this.password}`);
//         this.password = await bcrypt.hash(this.password,10);
//         // console.log(`password ${this.password}`);
//         this.Confirmpassword = await bcrypt.hash(this.password,10);
//     }
//     next();
// })

const Register = new mongoose.model('user',employeeSchema);
module.exports = Register;