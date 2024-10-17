import "dotenv/config";
import express from "express";

import signinRoutes from './routes/signin-signup-routes.js';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

app.use('/api/userauth', signinRoutes);

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});