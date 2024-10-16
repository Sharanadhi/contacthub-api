import "dotenv/config";
import express from "express";

import userRoutes from './routes/user-routes.js';

const app = express();

const PORT = process.env.PORT || 5050;

app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});