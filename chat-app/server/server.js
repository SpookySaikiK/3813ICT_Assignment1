const express = require('express');
const cors = require('cors');
const http = require('http');

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

//CORS middleware
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:56309'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

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

//Start server
http.createServer(app).listen(PORT, () => {
    console.log(`Server listening on: ${PORT}`);
});
