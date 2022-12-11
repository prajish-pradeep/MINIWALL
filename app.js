//Importing the libraries
// This will allow us to import the express library and build an express application.
const express = require('express')
const app = express()

const mongoose = require('mongoose') //MangoDB Package for Node.JS to connect to MangoDB
const bodyParser = require('body-parser') //parse the incoming request bodies in a middleware before handling it. Here, 

require('dotenv/config') //to store the mangodb link seperately, this will secure the link

app.use(bodyParser.json()) //able to retrieve the data in JSON format

// Linking "posts" with "app.js"
const postsRoute = require('./routes/posts')

// Linking "auth" to "app.js"
const authRoute = require('./routes/auth')


// Whenever user wants to go to posts, Go directly to the "posts" using this route
app.use('/api/posts',postsRoute) //Middleware

// Whenever user wants to go to authorisation, Go directly to the "auth" using this route
app.use('/api/user',authRoute) //Middleware (Redirecting to appropriate end point)


mongoose.connect(process.env.DB_CONNECTOR, ()=>{  //connecting the mangodb with the saved env file
    console.log('MangoDB is connected')
    
})


//Listen to the certain port and start the server
app.listen(3000, ()=>{
    console.log('Server is up and running!!!')
})

