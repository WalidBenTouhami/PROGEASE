// src/modules/user-management/services/user.service.js

import User from '../models/user.model.js';
import { SecurityConfig } from '../../../config/constants.js';
import { redisClient } from '../../../utils/redis.js';
import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('UserService');

export class UserService {
    static async createUser(userData) {
        try {
            logger.info('Tentative de création d\'un nouvel utilisateur', { email: userData.email });
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                logger.warn('Utilisateur déjà existant', { email: userData.email });
                throw new Error('User already exists');
            }
            const newUser = await User.create(userData);
            logger.info('Utilisateur créé avec succès', { userId: newUser._id });
            return newUser;
        } catch (error) {
            logger.error('Erreur lors de la création de l\'utilisateur', { error: error.message });
            throw error;
        }
    }

    static async getUserWithCache(userId) {
        try {
            logger.info('Recherche de l\'utilisateur avec cache', { userId });
            const cacheKey = `user:${userId}`;
            const cachedUser = await redisClient.get(cacheKey);

            if (cachedUser) {
                logger.info('Utilisateur trouvé dans le cache', { userId });
                return JSON.parse(cachedUser);
            }

            const user = await User.findById(userId)
                .select('-password -loginAttempts')
                .lean();

            if (user) {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));
                logger.info('Utilisateur mis en cache', { userId });
            } else {
                logger.warn('Utilisateur non trouvé', { userId });
            }

            return user;
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'utilisateur', { error: error.message });
            throw error;
        }
    }

    static async updateUserSecurity(userId, updateData) {
        try {
            logger.info('Mise à jour des données de sécurité de l\'utilisateur', { userId });
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password');
            if (updatedUser) {
                logger.info('Mise à jour réussie', { userId });
            } else {
                logger.warn('Utilisateur non trouvé pour mise à jour', { userId });
            }
            return updatedUser;
        } catch (error) {
            logger.error('Erreur lors de la mise à jour de l\'utilisateur', { error: error.message });
            throw error;
        }
    }

    static async recordLoginAttempt(email, success) {
        try {
            logger.info('Enregistrement d\'une tentative de connexion', { email, success });
            const update = success
                ? { $set: { loginAttempts: 0 } }
                : { $inc: { loginAttempts: 1 }, $set: { lockUntil: Date.now() + SecurityConfig.PASSWORD.LOCKOUT_MINUTES * 60000 } };

            await User.updateOne({ email }, update);
            logger.info('Tentative de connexion enregistrée', { email, success });
        } catch (error) {
            logger.error('Erreur lors de l\'enregistrement de la tentative de connexion', { error: error.message });
            throw error;
        }
    }
}