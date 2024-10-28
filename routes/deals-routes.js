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

// Create deal API
router.post("/", verifyToken, async (req, res) => {
  const { title, status, product, amount, description,contact_id } = req.body;
  const user_id = req.userId;
  try {
    const [newDeal] = await knex("deals")
      .insert({
        title,
        product,
        amount,
        description,
        contact_id,
        status,
        user_id,
        created_at: knex.fn.now()
      })
      .returning('*');

    res.status(201).json({
      message: "Deal created successfully",
      deal: newDeal
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "An error occurred while creating the deal" });
  }
});

/// Get All Contacts by User ID API
router.get("/", verifyToken, async (req, res) => {
  const userId = req.userId;
  try {   
    const deals = await knex("deals")
      .join("users", "deals.user_id", "=", "users.id")
      .join("contacts","deals.contact_id", "=", "contacts.id")
      .select(
        "deals.*",
        "users.full_name as user_full_name",
        "contacts.first_name as contact_first_name",
        "contacts.last_name as contact_last_name",
      )
      .where("deals.user_id", userId);
    res.status(200).json({
      message: "Deals retrieved successfully",
      deals,
      userId
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while retrieving deals" });
  }
});

/// Get  Deal Details
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {    
    const deals = await knex("deals")
      .join("users", "deals.user_id", "=", "users.id")      
      .select(
        "deals.*",
        "users.full_name as user_full_name"
      )
      .where("deals.user_id", userId).where( "deals.id", id );

    res.status(200).json({
      message: "Deals retrieved successfully",
      deals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving deals" });
  }
});

// Update Status and Comments API
router.put("/status/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;

  try {
    
    await knex("deals")
      .where({ id })
      .update({ status, comments, lastupdated_at: knex.fn.now() });

    
    await knex("deal_logs").insert({
      deal_id: id,
      user_id: req.userId, 
      log_data: comments,
      created_at: knex.fn.now()
    });  
    const logs = await knex("deal_logs")
      .join("users", "deal_logs.user_id", "users.id")
      .where("deal_logs.deal_id", id)
      .select("deal_logs.*", "users.full_name as user_name");

    res.status(200).json({
      message: "Deal updated successfully",logs
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "An error occurred while updating the deal" });
  }
});

// get deal logs API
router.get("/logs/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await knex("deal_logs")
      .join("users", "deal_logs.user_id", "users.id")
      .where("deal_logs.deal_id", id)
      .select("deal_logs.*", "users.full_name as user_name");

    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving the deal logs" });
  }
});

export default router;