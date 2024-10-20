const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { Server } = require('socket.io');

//Send message route
router.post('/send', async (req, res) => {
    const { channelId, username, text } = req.body;
    const db = getDb();

    const newMessage = {
        channelId,
        username,
        text,
        timestamp: new Date()
    };

    try {
        await db.collection('messages').insertOne(newMessage);
        return res.status(200).send({ message: 'Message sent successfully', sentMessage: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).send({ message: 'Error sending message' });
    }
});

//Route to get messages for a specific channel
router.get('/:channelId', async (req, res) => {
    const { channelId } = req.params;
    const db = getDb();

    try {
        const messages = await db.collection('messages').find({ channelId: parseInt(channelId) }).toArray();
        return res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).send({ message: 'Error fetching messages' });
    }
});

module.exports = router;
