const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

//Get all users
router.get('/', (req, res) => {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        res.send(JSON.parse(data));
    });
});

//Create a new user
router.post('/', (req, res) => {
    const newUser = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        const users = JSON.parse(data);
        users.push(newUser);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) return res.status(500).send(err);
            res.status(201).send(newUser);
        });
    });
});

//Update a user
router.put('/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        let users = JSON.parse(data);
        const index = users.findIndex(user => user.id == id);
        if (index === -1) return res.status(404).send('User not found');

        users[index] = { ...users[index], ...req.body };

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) return res.status(500).send(err);
            res.send(users[index]);
        });
    });
});

//Delete a user
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        let users = JSON.parse(data);
        users = users.filter(user => user.id != id);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) return res.status(500).send(err);
            res.send({ message: 'User deleted successfully' });
        });
    });
});

module.exports = router;
