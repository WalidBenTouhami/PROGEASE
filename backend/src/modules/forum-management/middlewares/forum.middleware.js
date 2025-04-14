// src/modules/forum-management/middlewares/forum.middleware.js

import { Thread } from '../models/forum.model.js';
import { HTTP_STATUS } from '../../../config/constants.js';

export const threadContentValidation = (req, res, next) => {
    const { content } = req.body;
    const forbiddenWords = ['spam', 'http://', 'https://'];

    if (forbiddenWords.some(word => content.includes(word))) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            code: 'INVALID_CONTENT',
            message: 'Le contenu contient des éléments non autorisés'
        });
    }

    next();
};

export const threadRateLimiter = (windowMs = 15 * 60 * 1000, max = 5) => {
    const requests = new Map();

    return (req, res, next) => {
        const ip = req.ip;
        const currentTime = Date.now();

        if (!requests.has(ip)) {
            requests.set(ip, { count: 1, startTime: currentTime });
        } else {
            const record = requests.get(ip);

            if (currentTime - record.startTime > windowMs) {
                requests.set(ip, { count: 1, startTime: currentTime });
            } else if (record.count >= max) {
                return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Trop de requêtes - veuillez réessayer plus tard'
                });
            } else {
                requests.set(ip, { ...record, count: record.count + 1 });
            }
        }

        next();
    };
};