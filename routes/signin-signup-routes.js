import express from 'express';
import initKnex from "knex";
import configuration from "../knexfile.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import moment from 'moment';
import nodemailer from 'nodemailer';
import { type } from 'os';

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
        return res.status(400).json({ error: "Email is already registered",type:"email" });
      } else if (existingUser.phone === phone) {
        return res.status(400).json({ error: "Phone number is already registered",type:"phone" });
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
      return res.status(400).json({ error: "The email address you entered isn't connected to an account.",type:'email' });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "The password that you've entered is incorrect.",type:'password' });
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





export default router;