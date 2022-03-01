const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
    email: {
        type: String,
        required: "Email address is required",
        index: true,
        unique: true,
    },
    password: {
        type: String,
        required: "Password is required",
        trim: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
})

module.exports = mongoose.model("Auth", authSchema);