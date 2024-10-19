const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const channelsFilePath = path.join(__dirname, '../data/channels.json');

//Load channels from JSON
const loadChannels = () => {
    if (fs.existsSync(channelsFilePath)) {
        return JSON.parse(fs.readFileSync(channelsFilePath, 'utf8'));
    }
    return [];
};

//Save channels to JSON
const saveChannels = (data) => {
    fs.writeFileSync(channelsFilePath, JSON.stringify(data, null, 2));
};

//Create Channel Route
router.post('/create', (req, res) => {
    const { name, groupId } = req.body;
    const channels = loadChannels();

    //Find the next available channel ID
    const newChannelId = channels.length > 0 ? Math.max(...channels.map(c => c.id)) + 1 : 1;

    const newChannel = {
        id: newChannelId,
        name,
        groupId
    };

    channels.push(newChannel);
    saveChannels(channels);
    return res.status(201).send({ message: 'Channel created successfully', channel: newChannel });
});

//Get all channels Route
router.get('/', (req, res) => {
    const channels = loadChannels();
    return res.status(200).json(channels);
});

//Delete Channel Route
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    let channels = loadChannels();

    //Check if channel exists
    const channelExists = channels.some(c => c.id === parseInt(id));
    if (!channelExists) {
        return res.status(404).send({ message: 'Channel not found' });
    }

    //Remove the channel
    channels = channels.filter(c => c.id !== parseInt(id));
    saveChannels(channels);
    return res.status(200).send({ message: 'Channel deleted successfully' });
});

module.exports = router;
