// src/modules/user-management/models/user.model.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { SecurityConfig } from '../../../config/constants.js';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: Object.values(RoleEnum),
        default: RoleEnum.STUDENT
    },
    profile: {
        firstName: String,
        lastName: String,
        avatar: String,
        bio: { type: String, maxlength: 500 }
    },
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    lockUntil: {
        type: Date,
        select: false
    }
}, {
    timestamps: true,
    methods: {
        async comparePassword(candidatePassword) {
            return bcrypt.compare(candidatePassword, this.password);
        },

        isLocked() {
            return this.lockUntil && this.lockUntil > Date.now();
        }
    }
});

// 🛡️ Pré-save hook pour le hachage du mot de passe
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(SecurityConfig.PASSWORD.SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Index pour les recherches courantes
userSchema.index({ email: 1, role: 1 });

export default mongoose.model('User', userSchema);