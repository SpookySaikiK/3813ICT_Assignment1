const express = require('express');
const cors = require('cors');
const http = require('http');
const { connectToDatabase, getDb } = require('./db'); 
const { Server } = require('socket.io');

//Routes
const registerUserRouter = require('./router/registerUser');
const loginUserRouter = require('./router/loginUser');
const deleteUserRouter = require('./router/deleteUser');
const manageGroupRouter = require('./router/manageGroup');
const manageChannelRouter = require('./router/manageChannel');
const manageRequestsRouter = require('./router/manageRequests');
const manageMessagesRouter = require('./router/manageMessages');

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:4200', 'http://localhost:4201'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

//CORS middleware
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

//Connect to MongoDB
connectToDatabase().catch(console.error);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//User Routes
app.use('/registerUser', registerUserRouter);
app.use('/loginUser', loginUserRouter);
app.use('/deleteUser', deleteUserRouter);

//Group Routes
app.use('/manageGroup', manageGroupRouter);

//Channel Routes
app.use('/manageChannel', manageChannelRouter);

//Requests Routes
app.use('/manageRequests', manageRequestsRouter);

//Messages Routes
app.use('/manageMessages', manageMessagesRouter);


//Socket connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinChannel', async (channelId) => {
        socket.join(channelId);
        console.log(`User joined channel: ${channelId}`);
        
        const joinMessage = {
            text: 'User has entered the channel',
            username: 'System',
            timestamp: new Date(),
            channelId: channelId
        };

        //Save the join message to the database
        try {
            const db = getDb();
            await db.collection('messages').insertOne(joinMessage);
            io.to(channelId).emit('message', joinMessage);
        } catch (error) {
            console.error('Error saving join message:', error);
        }
    });

    socket.on('sendMessage', async (data) => {
        const { channelId, message } = data;

        //Save message to the database
        try {
            const db = getDb();
            await db.collection('messages').insertOne(message);
            io.to(channelId).emit('message', message);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('leaveChannel', async (channelId) => {
        socket.leave(channelId);
        console.log(`User left channel: ${channelId}`);

        const leaveMessage = {
            text: 'User has left the channel',
            username: 'System',
            timestamp: new Date(),
            channelId: channelId
        };

        //Save the leave message to the database
        try {
            const db = getDb();
            await db.collection('messages').insertOne(leaveMessage);
            io.to(channelId).emit('message', leaveMessage);
        } catch (error) {
            console.error('Error saving leave message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


//Start server
server.listen(PORT, () => {
    console.log(`Server listening on: ${PORT}`);
});
