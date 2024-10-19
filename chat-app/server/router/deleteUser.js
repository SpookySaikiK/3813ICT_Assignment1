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

//Delete User Route
router.delete('/:username', (req, res) => {
    const { username } = req.params;
    let users = loadUsers();

    //Filter out user to be deleted
    users = users.filter(user => user.username !== username);
    saveUsers(users);

    res.status(200).send({ message: 'User deleted successfully' });
});

module.exports = router;
