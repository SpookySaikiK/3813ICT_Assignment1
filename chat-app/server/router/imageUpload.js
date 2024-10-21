const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDb } = require('../db');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/images');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

//Image upload route
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No image file uploaded' });
  }

  const { channelId, username } = req.body;
  const imagePath = `http://localhost:3000/uploads/images/${req.file.filename}`;

  const newMessage = {
    channelId: parseInt(channelId),
    username,
    avatar: "http://localhost:3000/uploads/avatar/default-avatar.png",
    text: '',
    image: imagePath,
    timestamp: new Date()
  };

  try {
    res.status(200).send({ message: 'Image uploaded and message sent successfully', image: imagePath });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).send({ message: 'Error uploading image or saving message' });
  }
});

module.exports = router;
