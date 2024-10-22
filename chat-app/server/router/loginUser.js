const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const router = express.Router();
const usersFilePath = path.join(__dirname, '../data/users.json');

//Load users from JSON
const loadUsers = () => {
    if (fs.existsSync(usersFilePath)) {
        return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }
    return [];
};

//User Login Route
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    
    //Find user by username
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }

    //Compare the password using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(401).send({ message: 'Invalid password' });
    }

    //Successful login, return user info without the password
    const { password: pwd, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
});

module.exports = router;
