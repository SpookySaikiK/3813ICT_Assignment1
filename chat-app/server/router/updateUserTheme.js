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

//Update theme route
router.put('/', (req, res) => {
    const { username, theme } = req.body;
    let users = loadUsers();

    //Find the user and update their theme
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex === -1) {
        return res.status(404).send({ message: 'User not found' });
    }

    users[userIndex].theme = theme;
    saveUsers(users);

    return res.status(200).send({ message: 'Theme updated successfully' });
});

module.exports = router;
