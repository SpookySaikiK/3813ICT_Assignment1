const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const requestsFilePath = path.join(__dirname, '../data/requests.json');
const groupsFilePath = path.join(__dirname, '../data/groups.json');

//Load requests from JSON
const loadRequests = () => {
    if (fs.existsSync(requestsFilePath)) {
        return JSON.parse(fs.readFileSync(requestsFilePath, 'utf8'));
    }
    return [];
};

//Save requests to JSON
const saveRequests = (data) => {
    fs.writeFileSync(requestsFilePath, JSON.stringify(data, null, 2));
};

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
    const usersFilePath = path.join(__dirname, '../data/users.json');
    if (fs.existsSync(usersFilePath)) {
        return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }
    return [];
};


//Route for submitting a join or admin rights request
router.post('/request', (req, res) => {
    const { groupId, username, reason } = req.body;

    if (reason !== 'has requested to join the group' && reason !== 'has requested admin rights for this group') {
        return res.status(400).send({ message: 'Invalid reason provided' });
    }

    const requests = loadRequests();
    const existingRequest = requests.find(r => r.username === username && r.groupId === groupId && r.reason === reason);
    if (existingRequest) {
        return res.status(400).send({ message: 'Request already exists' });
    }

    const newRequest = {
        username,
        reason,
        groupId
    };
    requests.push(newRequest);
    saveRequests(requests);

    return res.status(201).send({ message: 'Request submitted successfully' });
});


//Route to approve a request
router.post('/approve', (req, res) => {
    //console.log('Approve request received:', req.body); 

    const { groupId, username } = req.body;
    const requests = loadRequests();
    const groups = loadGroups();
    const users = loadUsers();

    //Find the group based on the groupId
    const group = groups.find(g => g.id == groupId);
    //console.log('Group found:', group);

    //Check if user exists
    const user = users.find(u => u.username === username);
    //console.log('User found:', user); 

    //Find the request
    const requestIndex = requests.findIndex(r => r.username === username && r.groupId === groupId);
    //console.log('Request index:', requestIndex);
    if (requestIndex === -1) {
        return res.status(404).send({ message: 'Request not found' });
    }
    if (!user) {
        return res.status(404).send({ message: 'No such user exists' });
    }

    //Add user ID to group members or admins based on the request reason
    const request = requests[requestIndex];
    if (request.reason === 'has requested to join the group') {
        if (group && !group.members.includes(user.id)) {
            group.members.push(user.id);
            saveGroups(groups);
        }
    } else if (request.reason === 'has requested admin rights for this group') {
        if (group && !group.admins.includes(user.id)) {
            group.admins.push(user.id);
            saveGroups(groups);
        }
    }

    //Remove the request after processing
    requests.splice(requestIndex, 1);
    saveRequests(requests);
    return res.status(200).send({ message: 'Request approved successfully' });
});





//Route to reject a request
router.post('/reject', (req, res) => {
    const { groupId, username } = req.body;
    const requests = loadRequests();

    //Find the request
    const requestIndex = requests.findIndex(r => r.username === username && r.groupId === groupId);
    if (requestIndex === -1) {
        return res.status(404).send({ message: 'Request not found' });
    }

    //Remove the request and return success
    requests.splice(requestIndex, 1);
    saveRequests(requests);
    return res.status(200).send({ message: 'Request rejected successfully' });
});

//Route to get all requests for a specific group
router.get('/:groupId', (req, res) => {
    const { groupId } = req.params;
    const requests = loadRequests();
    const groupRequests = requests.filter(request => request.groupId == groupId);
    return res.status(200).json(groupRequests);
});

module.exports = router;
