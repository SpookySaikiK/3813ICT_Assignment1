const express = require('express');
const fs = require('fs');
const path = require('path');
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
router.post('/', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    
    //Find user by username
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }

    //Check password
    if (user.password !== password) {
        return res.status(401).send({ message: 'Invalid password' });
    }

    //Successful login, return user info
    const { password: pwd, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword); //Return user data without the password
});

module.exports = router;
