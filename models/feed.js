const mongoose  = require("mongoose");

const employeeSchema = new  mongoose.Schema({
    name:{
        type:String,
        require:true

    },
    email:{
        type:String,
        require:true,
        unique:true

    }
   
    
}) 


const feeddata = new mongoose.model('newsletter',employeeSchema);
module.exports = feeddata;