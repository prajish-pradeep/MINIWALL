const { send } = require('express/lib/response')
const jsonwebtoken = require('jsonwebtoken') //importing the library

function auth(req,res,next){    //creating a function 
    const token = req.header('auth-token') //grant access only if header consist of token
    if(!token){     //if token is not present in header, access should not be granted
        return res.status(401).send({message:'Access denied'})
    }
    try{
        const verified = jsonwebtoken.verify(token,process.env.TOKEN_SECRET)
        req.user=verified
        next() //continue to next middleware
    }catch(err){  //if token is wrong in header, access should not be granted
        return res.status(401).send({message:'Invalid token'})
    }
}

module.exports=auth