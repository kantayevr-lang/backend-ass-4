const { ObjectId } = require("mongodb");
const connectDB = require("../db/mongo");
const { validateBlogInput } = require("../utils/validate");
const { sanitizeText } = require("../utils/sanitize");

function parseObjectId(id) {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
}

exports.createBlog = async (req, res, next) => {
    try {
        const title = sanitizeText(req.body.title);
        const body = sanitizeText(req.body.body);

        const errors = validateBlogInput({ title, body });
        if (errors.length) {
            return res.status(400).json({ message: "Validation failed", details: errors });
        }

        const db = await connectDB();
        const blogs = db.collection("blogs");

        const now = new Date();
        const doc = {
            title,
            body,
            author: req.user.userId,
            createdAt: now,
            updatedAt: now
        };

        const result = await blogs.insertOne(doc);
        const created = await blogs.findOne({ _id: result.insertedId });

        return res.status(201).json({ blog: created });
    } catch (err) {
        return next(err);
    }
};

exports.getAllBlogs = async (req, res, next) => {
    try {
        const db = await connectDB();
        const blogs = await db.collection("blogs").find().sort({ createdAt: -1 }).toArray();
        return res.json({ blogs });
    } catch (err) {
        return next(err);
    }
};

exports.getBlogById = async (req, res, next) => {
    try {
        const id = parseObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid blog id" });

        const db = await connectDB();
        const blog = await db.collection("blogs").findOne({ _id: id });

        if (!blog) return res.status(404).json({ message: "Blog not found" });

        return res.json({ blog });
    } catch (err) {
        return next(err);
    }
};

exports.updateBlog = async (req, res, next) => {
    try {
        const id = parseObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid blog id" });

        const db = await connectDB();
        const blogs = db.collection("blogs");

        const blog = await blogs.findOne({ _id: id });
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        if (blog.author !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updates = {};
        if (typeof req.body.title === "string") updates.title = sanitizeText(req.body.title);
        if (typeof req.body.body === "string") updates.body = sanitizeText(req.body.body);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const errors = validateBlogInput({
            title: updates.title ?? blog.title,
            body: updates.body ?? blog.body
        });
        if (errors.length) {
            return res.status(400).json({ message: "Validation failed", details: errors });
        }

        updates.updatedAt = new Date();

        await blogs.updateOne({ _id: id }, { $set: updates });
        const updated = await blogs.findOne({ _id: id });

        return res.json({ blog: updated });
    } catch (err) {
        return next(err);
    }
};

exports.deleteBlog = async (req, res, next) => {
    try {
        const id = parseObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "Invalid blog id" });

        const db = await connectDB();
        const blogs = db.collection("blogs");

        const blog = await blogs.findOne({ _id: id });
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        if (blog.author !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

        await blogs.deleteOne({ _id: id });
        return res.json({ message: "Blog deleted" });
    } catch (err) {
        return next(err);
    }
};
