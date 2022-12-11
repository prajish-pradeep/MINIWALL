const mongoose = require('mongoose') //Import the Mongoose library

const userSchema = mongoose.Schema({ //Users should have username, email and password as defined
    username:{
        type:String,
        require:true,
        min:3,
        max:256
    },
    email:{
        type:String,
        require:true,
        min:6,
        max:256
    },
    password:{
        type:String,
        require:true,
        min:6,
        max:1024     //password characters are long since password needs to be hashed
    },
    date:{
        type:Date,
        default:Date.now
    },
}) 

module.exports= mongoose.model('users',userSchema) //mapping as per the mangodb database name
