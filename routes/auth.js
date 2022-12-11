//Authentication

//Importing the libraries
const express = require('express')
const router = express.Router()

const User = require('../models/User') // Linking "User" with "auth.js"
const {registerValidation,loginValidation} = require('../validations/validation') //importing both the register and login validation

const bcryptjs = require('bcryptjs')  //encrypt and decrypt the password
const jsonwebtoken = require('jsonwebtoken') //generating auth-tokens

//register validations

router.post('/register', async(req,res)=>{
     //Validation 1 to check user input (requirements)
     const {error} = registerValidation(req.body) //jump directly to the error
     if(error){
          return res.status(400).send({message:error['details'][0]['message']}) //entering the list, index[0]- where the error message is present
     }
     //Validation 2 to check user already exist (using joi packets)
     const userExists = await User.findOne({email:req.body.email})
     if(userExists){
          return res.status(400).send({message:'User already exists'})
     }
     
     // I created a hashed representation of my password
     const salt = await bcryptjs.genSalt(5) //add randomness and generate complexity
     const hashedPassword = await bcryptjs.hash(req.body.password,salt) //taking the passowrd and returning back with hashed representation
     
     
//Code to insert data

const user = new User({
     username:req.body.username,
     email:req.body.email,
     password:hashedPassword
 })
 try{
     const savedUser = await user.save()
     res.send(savedUser)
 }catch(err){
     res.status(400).send({message:err})   //send back
 }
 
})

//login validation

router.post('/login', async(req,res)=>{
     
     //Validation 1 to check user input
     const {error} = loginValidation(req.body)
     if(error){
          return res.status(400).send({message:error['details'][0]['message']})
     }   

     //Validation 2 to check user exist (using joi)
     const user = await User.findOne({email:req.body.email})
     if(!user){
          return res.status(400).send({message:'User does not exist'})
     }

     //Validation 3 to check user password
     const passwordValidation = await bcryptjs.compare(req.body.password,user.password) 
     if(!passwordValidation){
          return res.status(400).send({message:'Password is incorrect'})
     }
     
     // Generate an auth-token
     const token = jsonwebtoken.sign({_id:user._id}, process.env.TOKEN_SECRET) //create a json webtoken, and take the token secret and generate a token
     res.header('auth-token',token).send({'auth-token':token})

})

module.exports = router //export