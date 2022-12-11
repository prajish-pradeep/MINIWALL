const joi = require('joi') //import the "joi" library to validate the data as per schema

const registerValidation = (data)=> {
    const schemaValidation = joi.object({ //following the joi object validation rules for register
        username:joi.string().required().min(3).max(256),
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)
    })
    return schemaValidation.validate(data)
}

const loginValidation = (data)=> {   //following the joi object validation rules for login
    const schemaValidation = joi.object({
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)
    })
    return schemaValidation.validate(data)
}



//export
module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation