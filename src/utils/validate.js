function isNonEmptyString(x) {
    return typeof x === "string" && x.trim().length > 0;
}

function validateEmail(email) {
    if (!isNonEmptyString(email)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password) {
    return isNonEmptyString(password) && password.trim().length >= 6;
}

function validateBlogInput({ title, body }) {
    const errors = [];
    if (!isNonEmptyString(title)) errors.push("Title is required");
    if (!isNonEmptyString(body)) errors.push("Body is required");
    return errors;
}

module.exports = {
    isNonEmptyString,
    validateEmail,
    validatePassword,
    validateBlogInput
};
