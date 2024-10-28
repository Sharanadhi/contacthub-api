import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from 'multer';
import path from 'path';
import initKnex from "knex";
import configuration from "./knexfile.js";

const knex  = initKnex(configuration);


import signinRoutes from './routes/signin-signup-routes.js';
import contactRoutes from './routes/contact-routes.js';
import dealRoutes from './routes/deals-routes.js';

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;


app.use(cors());
app.use(express.json());
app.use(express.static('public/images'));

// Set storage engine
const storage = multer.diskStorage({
  destination: 'public/images',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  // limits: { fileSize: 1000000 }, 
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('profileImage');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

app.use('/api/userauth', signinRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);

app.use('/public/images', express.static('public/images'));


app.post('/api/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).json({ message: err });
    } else {
      if (req.file == undefined) {
        res.status(400).json({ message: 'No file selected!' });
      } else {
        const contactId = req.body.contact_id;
        const filePath = `public/images/${req.file.filename}`;
        try {
          // Update the database with the file path
          await knex('contacts').where('id', contactId).update({
            profile_picture: `${BACKEND_URL}/${filePath}`
          });
          res.status(200).json({ message: 'File uploaded and contact updated!', file: `${BACKEND_URL}/${filePath}` });
        } catch (error) {
          res.status(500).json({ message: 'Database update failed' });
        }
      }
    }
  });
});

app.listen(PORT, () => {
    console.log(`Listening at ${BACKEND_URL}`);
});