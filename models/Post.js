const mongoose = require('mongoose') //Import the Mongoose
const User = require('../models/User')

//Creating the schema similar to the mangoDB database
const PostSchema = mongoose.Schema({
    User:{           //mapped to the "username" in "users"(see "post.js"). This will automatically populate the post owner's username.
        type:String,
        required:true
    },
    Title:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Hashtag:{ //This Miniwall accepts posts without hashtag
    },
    Location:{
        type:String, //doesn't need to be a required field to post
    },
    Date:{
        type:Date,
        default:Date.now
    },
    Like:{       // Set to '0' by default
        type:Number,
        default:0
    },
    Comment:[      //an array consisting of comment, date & time, and comment owner
        {
            CommentText:{
                type: String,
            },
            TimeStamp:{
                type:String,
            },
            CommentBy:{
                type:String,
            }
        }
    ]
 })

 module.exports = mongoose.model('posts', PostSchema)   //Map with MangoDB collection
