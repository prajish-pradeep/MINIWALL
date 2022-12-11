//Importing the libraries
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const verifyToken = require('../verifyToken') //import from verififyToken.js

const Post = require('../models/Post') //mongoose model to insert data in my database
const User = require('../models/User')

//1. POST (Create Data)
router.post('/', verifyToken, async(req,res)=>{
        //console.log(req.user)
        const userobj = await User.findOne({_id:mongoose.Types.ObjectId(req.user._id)}) // taking the data of owner of the Post (post owner) from "users" database.
        //console.log(userobj)
    const postData = new Post({  //create a new model which will be mapped to the model of mongoose
        User:userobj.username,  //This will automatically populate the post owner's username when post is created.
        Title:req.body.Title,
        Description:req.body.Description,
        Hashtag:req.body.Hashtag,
        Location:req.body.Location
    })
    //try to insert..
    try{
        const postToSave = await postData.save() //save data to mongoose(extract everything and save to database)
        res.send(postToSave)
    }catch(err){
        res.send({message:err})
    }
})

//2. GET
//GET (i)- (Read all posts) & Sort as per requirements
router.get('/',verifyToken, async(req,res)=>{
    try{
        const getPosts = await Post.find();
        let postsWithLikes = [];
        let postWithoutLikes = [];

        //seperating the postd that has likes or no likes
        getPosts.forEach(post=>{
            if(post.Like > 0){
                postsWithLikes.push(post)
            }
            else{
                postWithoutLikes.push(post)
            }
        })

        //Sorting Post with same number of likes, and by timestamp
        const SortPostWithLikes = postsWithLikes.sort((a,b)=>{
            const d1 = a.Like
            const d2 = b.Like
            if (d1 < d2)
                return 1;
            if (d1 > d2)
                return -1;
            if (d1 === d2){
                const e1 = a.Date
                const e2 = b.Date
                if (e1 < e2)
                    return 1;
                if (e1 > e2)
                    return -1;
                if (e1 === e2)
                    return 0;
            }
                
            return NaN;
        })

        //Sorting Post Without Likes by timestamp
        const SortPostWithoutLikes = postWithoutLikes.sort((a,b)=>{
            const d1 = a.Date
            const d2 = b.Date
            if (d1 < d2)
                return 1;
            if (d1 > d2)
                return -1;
            if (d1 === d2)
                return 0;
            return NaN;
        })

        let SortedPosts = [];
        SortedPosts.push(SortPostWithLikes);
        SortedPosts.push(SortPostWithoutLikes);

        res.send(SortedPosts)

    }catch(err){
        res.send({message:err})
    }
})

//GET (ii)- (Read post by ID)
router.get('/:postId',verifyToken, async(req,res)=>{
    try{
        const getPostById = await Post.findById(req.params.postId) //read by Id
        res.send(getPostById)

    }catch(err){
        res.send({message:err})
    }
})

//3. PATCH(Update the post) Only Post Owners can update their post
//get postId from user and match it with postId of database, and then update the data 

router.patch('/:postId', verifyToken, async(req,res) =>{
    try{
        Post.findById(req.params.postId,async function (err,post){
            const userobj = await User.findOne({_id:req.user._id}) //taking the data of owner of the Post (post owner) from "users" database.
            //console.log(userobj)
            if(post.User == userobj.username){
                const updatePostById = await Post.updateOne(
                    {_id:req.params.postId},
                    {$set:{
                        User:req.body.User,
                        Title:req.body.Title,
                        Description:req.body.Description,
                        Hashtag:req.body.Hashtag,
                        Location:req.body.Location
                        }
                    })
                 res.send({message: updatePostById + "Post has been edited successfully"})
            }
            else{
                res.send({message:"You are not authorised to edit this post"})
            }
        });
    }catch(err){
        res.send({message:err})
    }
})

//4. DELETE (Delete) (Only post owner can delete the post)

//get postId from user and delete the post

router.delete('/:postId',verifyToken,async (req,res)=>{
    try{
        Post.findById(req.params.postId,async function (err,post){
            const userobj = await User.findOne({_id:req.user._id}) //taking the data of owner of the Post (post owner) from "users" database.
            //console.log(userobj)
            if(post.User == userobj.username){
                await Post.deleteOne({_id:req.params.postId})
                res.send({message:"Selected post has been deleted successfully"})
            }
            else{
                res.send({message:"You are not authorised to delete this post"})
            }
        });
    }catch(err){
        res.send({message:err})
    }    
});

//5. Implementing the Like functionality as per the requirent (post owner cannot like post)

router.patch('/like/:postId', verifyToken, async function (req,res){
    const currentPost = await Post.findOne({_id:req.params.postId}) //identifying post
    const loggeduserobj = await User.findOne({_id:req.user._id}) //identifying post owner

    if(currentPost.User != loggeduserobj.username){   //implementing post owner cannot like their post
        Post.findByIdAndUpdate(req.params.postId,{Like:currentPost.Like+1},{new:true},function(err,data){ //incrementing by 1
            if(err){res.send(err)}
            res.send({message: req.params.postId + " Post Liked successfully"}) 
        });
    }
    else{
        res.send({message: " You cannot Like your Post"});
    }
    
});

//6. Unlike functionality to Undo the Like

router.patch('/unlike/:postId', verifyToken, async function (req,res){
    const currentPost = await Post.findOne({_id:req.params.postId}) //identifying post
    const loggeduserobj = await User.findOne({_id:req.user._id}) //identifying post owner


    if(currentPost.User != loggeduserobj.username){
        Post.findByIdAndUpdate(req.params.postId,{Like:currentPost.Like-1},{new:true},function(err,data){ //decrementing by 1
            if(err){res.send(err)}
            res.send({message: req.params.postId + "Unliked Post successfully"}) 
        });
    }
    else{
        res.send({message: "Unable to Unlike your Post"});
    }   
});

//7. Implementing the comment functionality in post as per the requirement (post owner cannot comment on his post)

router.put('/comment/:postId', verifyToken, async function(req,res){
    const currentPost = await Post.findOne({_id:req.params.postId}) //identifying post
    const loggeduserobj = await User.findOne({_id:req.user._id}) //identifying post owner
    let comments = currentPost.Comment;
    comments.push(
        {
            CommentText: req.body.CommentText,
            TimeStamp: new Date().getTime(),
            CommentBy: loggeduserobj.username       
        }
    )

    if(currentPost.User != loggeduserobj.username){ //implementing post owner cannot comment on their post
        Post.findByIdAndUpdate(
            req.params.postId,
            {
                Comment : comments
            },
            {new:true},
            function(err,data){
            if(err){res.send(err)}
            res.send({message: currentPost._id + " Comment Post successfull"}) 
        });
    }
    else{
        res.send({message: "Unable to Comment your own Post"});
    } 
})

// Exporting the Router
module.exports = router

