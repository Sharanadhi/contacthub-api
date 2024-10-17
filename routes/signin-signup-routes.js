import express from 'express';
import initKnex from "knex";
import configuration from "../knexfile.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import moment from 'moment';
import nodemailer from 'nodemailer';

const knex  = initKnex(configuration);
const router = express.Router();

const secretKey = process.env.SECRET_KEY; 


// Sign-Up API
router.post("/signup", async (req, res) => {
  const { full_name, email, phone, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await knex("users").where({ email }).orWhere({ phone }).first();

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email is already registered" });
      } else if (existingUser.phone === phone) {
        return res.status(400).json({ error: "Phone number is already registered" });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const [newUser] = await knex("users").insert({
      full_name,
      email,
      phone,
      password: hashedPassword
    }).returning('*');

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, secretKey, {
      expiresIn: "1h" // Token expiry time
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: "An error occurred during sign-up" });
  }
});

// Sign-In API
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await knex("users").where({ email }).first();

    if (!user) {
      return res.status(400).json({ error: "The email address you entered isn't connected to an account." });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "The password that you've entered is incorrect." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
      expiresIn: "1h" // Token expiry time
    });

    res.status(200).json({
      message: "Sign-in successful",
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during sign-in" });
  }
});


// Generate Password Reset Token API
router.post("/reset-password", async (req, res) => {
  const token = crypto.randomBytes(20).toString('hex');
  const tokenExpiration = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'); 
  const { email } = req.body;
  try {
    const user = await knex("users").where({ email }).first();
    if (!user) {
      return res.status(400).json({ error: "The email address you entered isn't connected to an account." });
    }

    // Generate a token
    // const token = crypto.randomBytes(20).toString('hex');
    // const tokenExpiration = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'); 

    await knex("users")
      .where({ email })
      .update({ resetPasswordToken: token, resetPasswordExpires: tokenExpiration });

    // Send the email with the token
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click this link to reset your password: http://localhost:5173/reset/${token}`
    };

    console.log('Sending email to:', email);
console.log('Mail options:', mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });
    

    res.status(200).json({ message: "Password reset link sent",token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while processing your request" });
  }
});

// Reset Password API
router.post("/reset/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find user by token and check if the token has expired
    const user = await knex("users")
      .where({ resetPasswordToken: token })
      .andWhere('resetPasswordExpires', '>', knex.raw('CURRENT_TIMESTAMP'))
      .first();

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and clear the reset token
    await knex("users")
      .where({ id: user.id })
      .update({ password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null });

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while resetting your password" });
  }
});


export default router;