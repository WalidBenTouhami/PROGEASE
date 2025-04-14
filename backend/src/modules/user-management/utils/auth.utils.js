// src/modules/user-management/utils/auth.utils.js

import jwt from 'jsonwebtoken';
import { SecurityConfig } from '../../../config/constants.js';

export const AuthUtils = {
    generateToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 heure
            },
            SecurityConfig.JWT.SECRET,
            { algorithm: 'HS512' }
        );
    },

    verifyToken: (token) => {
        try {
            return jwt.verify(token, SecurityConfig.JWT.SECRET, {
                algorithms: ['HS512']
            });
        } catch (error) {
            throw new Error('Token invalide ou expiré');
        }
    }
};