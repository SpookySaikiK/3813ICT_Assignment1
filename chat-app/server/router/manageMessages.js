const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const messagesFilePath = path.join(__dirname, '../data/messages.json');

//Load messages from JSON
const loadMessages = () => {
    if (fs.existsSync(messagesFilePath)) {
        return JSON.parse(fs.readFileSync(messagesFilePath, 'utf8'));
    }
    return [];
};

//Save messages to JSON
const saveMessages = (data) => {
    fs.writeFileSync(messagesFilePath, JSON.stringify(data, null, 2));
};


//Send message route
router.post('/send', (req, res) => {
    const { channelId, username, text, timestamp } = req.body;

    //Load existing messages
    const messages = loadMessages();

    //Create a new message object
    const newMessage = {
        channelId,
        username,
        text,
        timestamp
    };

    //Add the new message to the messages array
    messages.push(newMessage);
    saveMessages(messages); //Save the updated messages

    return res.status(200).send({ message: 'Message sent successfully', sentMessage: newMessage });
});

//Route to get messages for a specific channel
router.get('/:channelId', (req, res) => {
    const { channelId } = req.params;
    const messages = loadMessages();
    const channelMessages = messages.filter(msg => msg.channelId === parseInt(channelId));
    return res.status(200).json(channelMessages);
});


module.exports = router;
