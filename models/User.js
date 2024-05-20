const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = new mongoose.Schema({
    firstName: {
        type: String,
        required : true,
    },
    lastName: {
        type: String,
        required : true,
    },
    email: {
        type: String,
        required : true,
        unique: true,
    //     validate: {
    //       validator: validator.isEmail,
    //       message: 'Invalid email address'
    // }
    },
    userName: {
        type: String,
        required : true,
    },
    password: {
        type: String,
        required : true,
        minLength: [6, "Password must be up to 6 characters"],

    },
    resetToken:{
        type:String  
      },
      resetTokenExpiration: {
        type: Date  
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
})


  
const UserModel = mongoose.model("User", User);
module.exports = UserModel;