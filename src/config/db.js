const { MongoClient } = require("mongodb");

let db;

async function connectDB() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db("blog_api");
    console.log("MongoDB connected")
}

function getDB() {
    return db;
}

module 