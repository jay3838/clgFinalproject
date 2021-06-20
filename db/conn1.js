const mongoose= require('mongoose');
mongoose.connect("mongodb+srv://admin:jayp1605@cluster0.7ua7n.mongodb.net/testingdata?retryWrites=true&w=majority",{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology: true 
}).then(()=>{
    console.log("Done connection blog and register");
}).catch((e)=>{
    console.log("sry blog");
})
