const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const groupsFilePath = path.join(__dirname, '../data/groups.json');
const usersFilePath = path.join(__dirname, '../data/users.json');


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

//Leave group route
router.post('/leave', (req, res) => {
    const { groupId, userId } = req.body;
    const groups = loadGroups();

    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).send({ message: 'Group not found' });
    }

    //Check if the user is a member of the group
    if (!group.members.includes(userId)) {
        return res.status(400).send({ message: 'User is not a member of this group' });
    }

    //Remove the user from the group
    group.members = group.members.filter(memberId => memberId !== userId);
    saveGroups(groups); //Save the updated groups back to JSON

    return res.status(200).send({ message: 'User left the group successfully' });
});


//Add Member to Group
router.post('/addMember', (req, res) => {
    const { groupId, username } = req.body;

    console.log('Received request to add member:', { groupId, username });

    const groups = loadGroups();
    const group = groups.find(g => g.id == groupId);

    if (!group) {
        console.log(`Group not found: ${groupId}`);
        return res.status(404).send({ message: 'Group not found' });
    }

    const users = loadUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        console.log(`No such user exists: ${username}`);
        return res.status(404).send({ message: 'No such user exists' });
    }

    console.log(`User ${username} found with ID: ${user.id}`);

    if (!group.members.includes(user.id)) {
        group.members.push(user.id); 
        saveGroups(groups);
        console.log(`User ${username} added to group ${groupId}`);
        return res.status(200).send({ message: 'User added to group successfully' });
    } else {
        console.log(`User ${username} is already a member of group ${groupId}`);
        return res.status(400).send({ message: 'User is already a member of this group' });
    }
});

//Remove Member from Group
router.post('/removeMember', (req, res) => {
    const { groupId, username } = req.body;

    console.log('Received request to remove member:', { groupId, username });

    const groups = loadGroups();
    const group = groups.find(g => g.id == groupId);

    if (!group) {
        console.log(`Group not found: ${groupId}`);
        return res.status(404).send({ message: 'Group not found' });
    }

    const users = loadUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        console.log(`No such user exists: ${username}`);
        return res.status(404).send({ message: 'No such user exists' });
    }

    console.log(`User ${username} found with ID: ${user.id}`);

    if (group.members.includes(user.id)) {
        group.members = group.members.filter(memberId => memberId !== user.id);
        saveGroups(groups); //Save the updated groups back to the JSON file
        console.log(`User ${username} removed from group ${groupId}`);
        return res.status(200).send({ message: 'User removed from group successfully' });
    } else {
        console.log(`User ${username} is not a member of group ${groupId}`);
        return res.status(400).send({ message: 'User is not a member of this group' });
    }
});

//Promote User Route
router.post('/promote', (req, res) => {
    const { username, role } = req.body;

    console.log('Received request to promote user:', { username, role });

    const users = loadUsers(); 
    const user = users.find(u => u.username === username);

    if (!user) {
        console.log(`No such user exists: ${username}`); 
        return res.status(404).send({ message: 'No such user exists' });
    }

    //Check if the role is valid
    if (role === 'superAdmin' && !user.roles.includes('superAdmin')) {
        user.roles.push('superAdmin'); //Promote to superAdmin
        console.log(`User ${username} promoted to Super Admin`); 
    } else if (role === 'groupAdmin' && !user.roles.includes('groupAdmin')) {
        user.roles.push('groupAdmin'); //Promote to groupAdmin
        console.log(`User ${username} promoted to Group Admin`);
    } else {
        return res.status(400).send({ message: `${username} is already a ${role}.` });
    }

    saveUsers(users); //Save updated users back to the JSON file
    return res.status(200).send({ message: `User ${username} promoted to ${role} successfully!` });
});




module.exports = router;
