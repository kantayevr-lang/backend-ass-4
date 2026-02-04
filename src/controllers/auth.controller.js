const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const connectDB = require("../db/mongo");
const { validateEmail, validatePassword } = require("../utils/validate");

function toSafeUser(userDoc) {
    return {
        id: userDoc._id,
        email: userDoc.email,
        role: userDoc.role,
        createdAt: userDoc.createdAt
    };
}

exports.register = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!validateEmail(email) || !validatePassword(password)) {
            return res.status(400).json({
                message: "Invalid input",
                details: ["Email must be valid", "Password must be at least 6 characters"]
            });
        }

        const userRole = role === "admin" ? "admin" : "user";

        const db = await connectDB();
        const users = db.collection("users");

        const passwordHash = await bcrypt.hash(password, 10);

        const now = new Date();
        const doc = {
            email: email.trim().toLowerCase(),
            passwordHash,
            role: userRole,
            createdAt: now
        };

        const result = await users.insertOne(doc);

        const created = await users.findOne({ _id: result.insertedId });
        return res.status(201).json({ user: toSafeUser(created) });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(400).json({ message: "Invalid input", details: ["Email already in use"] });
        }
        return next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const invalid = () => res.status(401).json({ message: "Invalid credentials" });

        if (!validateEmail(email) || typeof password !== "string") {
            return invalid();
        }

        const db = await connectDB();
        const users = db.collection("users");

        const user = await users.findOne({ email: email.trim().toLowerCase() });
        if (!user) return invalid();

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return invalid();

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        return res.json({ token });
    } catch (err) {
        return next(err);
    }
};

exports.logout = async (req, res) => {
    return res.json({ message: "Logged out" });
};

exports.me = async (req, res, next) => {
    try {
        const db = await connectDB();
        const users = db.collection("users");

        const user = await users.findOne({ _id: new ObjectId(req.user.userId) });
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({ user: toSafeUser(user) });
    } catch (err) {
        return next(err);
    }
};
