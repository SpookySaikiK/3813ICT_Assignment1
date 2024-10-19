const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const groupsFilePath = path.join(__dirname, '../data/groups.json');

//Load groups from JSON
const loadGroups = () => {
    if (fs.existsSync(groupsFilePath)) {
        return JSON.parse(fs.readFileSync(groupsFilePath, 'utf8'));
    }
    return [];
};

//Save groups to JSON
const saveGroups = (data) => {
    fs.writeFileSync(groupsFilePath, JSON.stringify(data, null, 2));
};

//Create group route
router.post('/create', (req, res) => {
    const { name, ownerName, adminId } = req.body;
    const groups = loadGroups();

    //Determine the next available group ID
    const newGroupId = groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1;

    const newGroup = {
        id: newGroupId,
        name,
        ownerName,
        admins: [adminId],
        members: [adminId]
    };

    groups.push(newGroup);
    saveGroups(groups);
    return res.status(201).send({ message: 'Group created successfully', group: newGroup });
});

//Get all groups Route
router.get('/', (req, res) => {
    const groups = loadGroups();
    return res.status(200).json(groups);
});

//Delete Group Route
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    let groups = loadGroups();

    //Check if group exists
    const groupExists = groups.some(g => g.id === parseInt(id));
    if (!groupExists) {
        return res.status(404).send({ message: 'Group not found' });
    }

    //Remove the group
    groups = groups.filter(g => g.id !== parseInt(id));
    saveGroups(groups);
    return res.status(200).send({ message: 'Group deleted successfully' });
});

module.exports = router;
