const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const blogRoutes = require("./routes/blog.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware")

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Secure REST blog API" }));

app.use("/auth", authRoutes);
app.use("/blogs", blogRoutes);



module.exports = app;