// src/models/user.model.js

const mongoose = require('mongoose');
const { Enums } = require('../../config/constants');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: Object.values(Enums.UserRole),
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);