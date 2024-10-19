const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');

const groupsFilePath = path.join(__dirname, '../data/groups.json');

//Get all groups
router.get('/', (req, res) => {
    fs.readFile(groupsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        res.send(JSON.parse(data));
    });
});

//Create a new group
router.post('/', (req, res) => {
    const newGroup = req.body;

    fs.readFile(groupsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        const groups = JSON.parse(data);
        groups.push(newGroup);

        fs.writeFile(groupsFilePath, JSON.stringify(groups, null, 2), (err) => {
            if (err) return res.status(500).send(err);
            res.status(201).send(newGroup);
        });
    });
});

//Update a group
router.put('/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(groupsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        let groups = JSON.parse(data);
        const index = groups.findIndex(group => group.id == id);
        if (index === -1) return res.status(404).send('Group not found');

        groups[index] = { ...groups[index], ...req.body };

        fs.writeFile(groupsFilePath, JSON.stringify(groups, null, 2), (err) => {
            if (err) return res.status(500).send(err);
            res.send(groups[index]);
        });
    });
});

//Delete a group
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(groupsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        let groups = JSON.parse(data);
        groups = groups.filter(group => group.id != id);

        fs.writeFile(groupsFilePath, JSON.stringify(groups, null, 2), (err) => {
            if (err) return res.status(500).send(err);
            res.send({ message: 'Group deleted successfully' });
        });
    });
});

module.exports = router;
