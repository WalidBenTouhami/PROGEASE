// src/modules/user-management/services/user.service.js

import User from '../models/user.model.js';
import { SecurityConfig } from '../../../config/constants.js';
import { redisClient } from '../../../utils/redis.js';

export class UserService {
    static async createUser(userData) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        return User.create(userData);
    }

    static async getUserWithCache(userId) {
        const cacheKey = `user:${userId}`;
        const cachedUser = await redisClient.get(cacheKey);

        if (cachedUser) {
            return JSON.parse(cachedUser);
        }

        const user = await User.findById(userId)
            .select('-password -loginAttempts')
            .lean();

        if (user) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));
        }

        return user;
    }

    static async updateUserSecurity(userId, updateData) {
        return User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');
    }

    static async recordLoginAttempt(email, success) {
        const update = success ?
            { $set: { loginAttempts: 0 } } :
            { $inc: { loginAttempts: 1 }, $set: { lockUntil: Date.now() + SecurityConfig.PASSWORD.LOCKOUT_MINUTES * 60000 } };

        await User.updateOne({ email }, update);
    }
}