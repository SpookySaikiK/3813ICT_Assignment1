const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

//Create Channel Route
router.post('/create', async (req, res) => {
    const { name, groupId } = req.body;
    const db = getDb();

    try {
        const channels = await db.collection('channels').find().toArray();

        //Calculate the next available ID based on existing channels
        const existingIds = channels.map(channel => channel.id);
        const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

        const newChannel = {
            id: nextId,
            name,
            groupId
        };

        await db.collection('channels').insertOne(newChannel);
        return res.status(201).send({ message: 'Channel created successfully', channel: newChannel });
    } catch (error) {
        console.error('Error creating channel:', error);
        return res.status(500).send({ message: 'Error creating channel' });
    }
});

//Get all channels Route
router.get('/', async (req, res) => {
    const db = getDb();

    try {
        const channels = await db.collection('channels').find().toArray();
        return res.status(200).json(channels);
    } catch (error) {
        return res.status(500).send({ message: 'Error fetching channels' });
    }
});

//Delete Channel Route
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const db = getDb();

    try {
        const result = await db.collection('channels').deleteOne({ id: parseInt(id) });
        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'Channel not found' });
        }
        return res.status(200).send({ message: 'Channel deleted successfully' });
    } catch (error) {
        return res.status(500).send({ message: 'Error deleting channel' });
    }
});

//Ban User from Channel
router.post('/ban', async (req, res) => {
    const { channelId, username, reason } = req.body;
    const db = getDb();

    const newBan = { channelId, username, reason };

    try {
        await db.collection('bannedUsers').insertOne(newBan);
        return res.status(200).send({ message: 'User banned successfully' });
    } catch (error) {
        return res.status(500).send({ message: 'Error banning user' });
    }
});

//Get all banned users Route
router.get('/bannedUsers', async (req, res) => {
    const db = getDb();

    try {
        const bannedUsers = await db.collection('bannedUsers').find().toArray();
        return res.status(200).json(bannedUsers);
    } catch (error) {
        return res.status(500).send({ message: 'Error fetching banned users' });
    }
});

module.exports = router;
