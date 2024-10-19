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

//Save users to JSON
const saveUsers = (data) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
};

//Register User Route
router.post('/', (req, res) => {
    const { username, password, email } = req.body;
    const users = loadUsers();

    //Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).send({ message: 'User already exists' });
    }

    //Create new user
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password, 
        roles: ['user'], 
        groups: []
    };
    
    users.push(newUser);
    saveUsers(users);
    return res.status(201).send({ message: 'User created successfully' });
});

module.exports = router;
