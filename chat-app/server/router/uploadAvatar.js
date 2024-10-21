const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const usersFilePath = path.join(__dirname, '../data/users.json');

//Load users from JSON
const loadUsers = () => {
    if (fs.existsSync(usersFilePath)) {
        return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }
    return [];
};

//Save users to JSON
const saveUsers = (data) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
};

//Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatar');
    },
    filename: (req, file, cb) => {
        cb(null, `${req.body.username}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

//Upload Avatar Router
router.post('/', upload.single('avatar'), (req, res) => {
    const { username } = req.body;

    console.log("Received data: ", req.body);

    if (!username) {
        return res.status(400).send({ message: 'Username is missing' });
    }

    let users = loadUsers();

    //Find user and update their avatar path
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.status(404).send({ message: 'User not found' });
    }

    users[userIndex].avatar = `uploads/avatar/${req.file.filename}`;

    //Save updated user data
    saveUsers(users);

    res.status(200).send({ message: 'Avatar uploaded successfully', avatarPath: `uploads/avatar/${req.file.filename}` });
});


module.exports = router;
