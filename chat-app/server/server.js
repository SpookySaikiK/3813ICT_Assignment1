const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToDatabase, getDb } = require('./db');
const usersRouter = require('./routes/users');
const groupsRouter = require('./routes/groups');
const channelsRouter = require('./routes/channels');

const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(bodyParser.json());

//Connect to MongoDB
connectToDatabase().catch(console.error);

//Use the routes
app.use('/api/users', usersRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/channels', channelsRouter);

//Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
