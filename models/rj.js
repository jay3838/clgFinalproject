const mongoose  = require("mongoose");

const employeeSchema = new  mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    content:{
        type:String,
        require:true

    },
    myImage:{
        type:String,
        required:true
    },
    Date:{
        type:String,
        required:true

    },
    name:[{
        type:String,
        require:true

    }],
    comment:[{
        type:String,
        require:true,
       
    }]
    
    
});


const ejsdata = new mongoose.model('blog',employeeSchema);
module.exports = ejsdata;