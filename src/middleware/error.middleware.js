function notFoundHandler(req, res) {
    res.status(404).json({ message: "Not found" });
}

function errorHandler(err, req, res, next) {
    console.error(err);

    const status = err.statusCode || 500;
    const message = err.publicMessage || "Internal server error";

    res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
