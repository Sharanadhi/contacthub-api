import express from 'express';
import initKnex from "knex";
import configuration from "../knexfile.js";
import jwt from 'jsonwebtoken';

const knex  = initKnex(configuration);
const router = express.Router();

const secretKey = process.env.SECRET_KEY; 

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }
  const tokenWithoutBearer = token.replace('Bearer ', '');
  jwt.verify(tokenWithoutBearer, secretKey, (err, decoded) => {
    if (err) {
      return res.status(500).json({ error: "Failed to authenticate token" });
    }
    req.userId = decoded.id;
    next();
  });
};

// Create Contact API
router.post("/", verifyToken, async (req, res) => {
  const { first_name, last_name, job_title, company, business_email, personal_email, business_phone, personal_phone, address, status, comments, profile_picture,linked_in } = req.body;
  const user_id = req.userId;
  try {
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
        linked_in,
        user_id
      })
      .returning('*');

    res.status(201).json({
      message: "Contact created successfully",
      contact: newContact
    });
  } catch (error) {
    console.error(error); 
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
      contacts,
      userId
    });
  } catch (error) {
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
      message: "Contact retrieved successfully",
      contacts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving contacts" });
  }
});

// Update Contact Details API
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, job_title, company, business_email, personal_email, business_phone, personal_phone, address,linked_in } = req.body;

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
        linked_in, 
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

    
    await knex("contact_logs").insert({
      contact_id: id,
      user_id: req.userId, 
      log_data: comments,
      status:status,
      created_at: knex.fn.now()
    });  
    res.status(200).json({
      message: "Contact updated successfully"
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "An error occurred while updating the contact" });
  }
});

// get Contact logs API
router.get("/logs/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await knex("contact_logs")
      .join("users", "contact_logs.user_id", "users.id")
      .where("contact_logs.contact_id", id)
      .select("contact_logs.*", "users.full_name as user_name");

    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving the contact logs" });
  }
});

// get Contact deals API
router.get("/deals/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const deals = await knex("deals")
      .join("users", "deals.user_id", "users.id")
      .where("deals.contact_id", id)
      .select("deals.*", "users.full_name as user_name");

    res.status(200).json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving the contact deals" });
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