const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'chatApp';
let db;

async function connectToDatabase() {
    const client = new MongoClient(url);
    await client.connect();
    console.log("Connected successfully to MongoDB server");
    db = client.db(dbName);
}

function getDb() {
    return db;
}

module.exports = { connectToDatabase, getDb };
