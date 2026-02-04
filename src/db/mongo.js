const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
    if (db) return db;

    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing in env");

    client = new MongoClient(uri);
    await client.connect();

    const dbName = process.env.DB_NAME || "blog_api";
    db = client.db(dbName);

    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("blogs").createIndex({ createdAt: -1 });

    return db;
}

module.exports = connectDB;
