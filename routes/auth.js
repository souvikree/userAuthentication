const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const { getToken } = require('../utils/helpers');
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, userName, password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(403).json({ error: "Email already exists" });
    }
    console.log("print password:", password);
    const salt=  bcrypt.genSaltSync(10)
    const hashedPassword =  bcrypt.hashSync(password, salt);  // Await the hash function
    console.log("Hashed Password:", hashedPassword);  // Debugging: Print hashed password

    const newUserData = { 
      firstName, 
      lastName, 
      email, 
      userName, 
      password: hashedPassword 
    };

    const newUser = await User.create(newUserData);
    const val= bcrypt.compareSync( password, hashedPassword )
    console.log("validation:",val)
   await newUser.save()
   console.log(newUser.password);

    const token = await getToken(newUser.email,newUser);
    // const userToReturn = { ...newUser.toJSON(), token };
    // delete userToReturn.password;
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 50000000),
      sameSite: "None",
      secure: true,
      httpOnly: true,
  });
    // await user.save();

    return res.status(200).json({ Messege: "Registration Successfull", newUser });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(403).json({ error: "Email doesn't match" });
    }
    console.log(user)

    const isPasswordValid =  bcrypt.compareSync(password, user.password  ); //$2b$10$XVx58ffSgUamg46g1WAtEessDG2G9LzMynTkNa7cP.OZ1CYK5o/SC
    console.log("Password Valid:", isPasswordValid);  // Debugging: Print result of password comparison
    console.log("User Password (hashed):", user.password);  // Debugging: Print hashed password from DB
    console.log("User Password (hashed):", password);  // Debugging: Print hashed password from DB
    console.log("Password Valid:", isPasswordValid);  // Debugging: Prin);  // Debugging: Print hashed password from DB

    if (isPasswordValid) {
      const userObject = user.toObject();
          delete userObject.password;
          
          const token = await getToken(user.email, user);
          // const token = jwt.sign({ userId: user._id, role: user.role },  process.env.SECRET_KEY, { expiresIn: '1h' });
          console.log(token);
          res.cookie("jwt", token, {
            expires: new Date(Date.now() + 50000000),
            sameSite: "None",
            secure: true,
            httpOnly: true,
        });
          res.status(200).json("Login successfully.");


        } else {
          res.status(401).json({ error: 'Invalid password' });
        }
      
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});


router.post('/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter an email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign({ userId: user._id }, 'thiskeyissupposedtobesecret', { expiresIn: '1h' });

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://localhost:8000/user/resetpassword?token=${token}`;
    const emailContent = `Click the link below to reset your password: ${resetLink}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SECRET_EMAIL,
        pass: process.env.EMAIL_PASS  // Replace with your email password or app-specific password
      }
    });

    const mailOptions = {
      from: process.env.SECRET_EMAIL,
      to: email,
      subject: 'Reset Password',
      text: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).json({ message: "Email sent" });
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/resetPassword', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({ resetToken: token  });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
