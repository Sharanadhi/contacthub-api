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

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(500).json({ error: "Failed to authenticate token" });
    }

    // Save the user ID for the next middleware
    req.userId = decoded.id;
    next();
  });
};

// Create Contact API
router.post("/", verifyToken, async (req, res) => {
  const { first_name, last_name, job_title, company, business_email, personal_email, business_phone, personal_phone, address, status, comments, profile_picture } = req.body;
  const user_id = req.userId;

  try {
    // Insert the new contact
    const [newContact] = await knex("contacts")
      .insert({
        first_name,
        last_name,
        job_title,
        company,
        business_email,
        personal_email,
        business_phone,
        personal_phone,
        address,
        status,
        comments,
        profile_picture,
        user_id
      })
      .returning('*');

    res.status(201).json({
      message: "Contact created successfully",
      contact: newContact
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: "An error occurred while creating the contact" });
  }
});

/// Get All Contacts by User ID API
router.get("/", verifyToken, async (req, res) => {
  const userId = req.userId;

  try {   
    const contacts = await knex("contacts")
      .join("users", "contacts.user_id", "=", "users.id")
      .select(
        "contacts.*",
        "users.full_name as user_full_name"
      )
      .where("contacts.user_id", userId);

    res.status(200).json({
      message: "Contacts retrieved successfully",
      contacts
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: "An error occurred while retrieving contacts" });
  }
});

/// Get  Contact Details
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {    
    const contacts = await knex("contacts")
      .join("users", "contacts.user_id", "=", "users.id")      
      .select(
        "contacts.*",
        "users.full_name as user_full_name"
      )
      .where("contacts.user_id", userId).where( "contacts.id", id );

    res.status(200).json({
      message: "Contacts retrieved successfully",
      contacts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving contacts" });
  }
});

// Update Status and Comments API
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;

  try {
    
    await knex("contacts")
      .where({ id })
      .update({ status, comments, updated_at: knex.fn.now() });

    res.status(200).json({
      message: "Contact updated successfully"
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "An error occurred while updating the contact" });
  }
});


// Update Contact Details API
router.put("/contacts/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, job_title, company, business_email, personal_email, business_phone, personal_phone, address } = req.body;

  try {
    // Update the contact details
    const rowsUpdated = await knex("contacts")
      .where({ id })
      .update({
        first_name,
        last_name,
        job_title,
        company,
        business_email,
        personal_email,
        business_phone,
        personal_phone,
        address,        
        updated_at: knex.fn.now()
      });

    if (rowsUpdated) {
      res.status(200).json({
        message: "Contact updated successfully"
      });
    } else {
      res.status(404).json({
        error: "Contact not found"
      });
    }
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "An error occurred while updating the contact" });
  }
});


// Update Status and Comments API
router.put("/status/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;

  try {
    
    await knex("contacts")
      .where({ id })
      .update({ status, comments, updated_at: knex.fn.now() });

    res.status(200).json({
      message: "Contact updated successfully"
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "An error occurred while updating the contact" });
  }
});

// Delete Contact API
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
   
    const rowsDeleted = await knex("contacts").where({ id }).del();

    if (rowsDeleted) {
      res.status(200).json({
        message: "Contact deleted successfully"
      });
    } else {
      res.status(404).json({
        error: "Contact not found"
      });
    }
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "An error occurred while deleting the contact" });
  }
});

export default router;