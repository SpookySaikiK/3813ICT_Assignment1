const express = require('express');
const cors = require('cors');
const http = require('http');

//Routes
const registerUserRouter = require('./router/registerUser');
const loginUserRouter = require('./router/loginUser');
const deleteUserRouter = require('./router/deleteUser'); 
const manageGroupRouter = require('./router/manageGroup');
const manageChannelRouter = require('./router/manageChannel'); 

const PORT = 3000;
const app = express();

//CORS middleware
app.use(cors({
    origin: 'http://localhost:4200',
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


//Start server
http.createServer(app).listen(PORT, () => {
    console.log(`Server listening on: ${PORT}`);
});
