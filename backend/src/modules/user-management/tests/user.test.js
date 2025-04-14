// src/modules/user-management/tests/user.test.js

import { UserService } from '../services/user.service.js';
import User from '../models/user.model.js';
import { redisClient } from '../../../utils/redis.js';

jest.mock('../models/user.model.js');
jest.mock('../../../utils/redis.js');

describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('devrait créer un nouvel utilisateur si l\'email n\'existe pas', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ id: '123', email: 'test@example.com' });

            const userData = { email: 'test@example.com', password: 'password123' };
            const result = await UserService.createUser(userData);

            expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
            expect(User.create).toHaveBeenCalledWith(userData);
            expect(result).toEqual({ id: '123', email: 'test@example.com' });
        });

        it('devrait lever une erreur si l\'utilisateur existe déjà', async () => {
            User.findOne.mockResolvedValue({ email: 'test@example.com' });

            const userData = { email: 'test@example.com', password: 'password123' };

            await expect(UserService.createUser(userData)).rejects.toThrow('User already exists');
            expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
            expect(User.create).not.toHaveBeenCalled();
        });
    });

    describe('getUserWithCache', () => {
        it('devrait retourner l\'utilisateur depuis le cache si disponible', async () => {
            redisClient.get.mockResolvedValue(JSON.stringify({ id: '123', email: 'test@example.com' }));

            const result = await UserService.getUserWithCache('123');

            expect(redisClient.get).toHaveBeenCalledWith('user:123');
            expect(result).toEqual({ id: '123', email: 'test@example.com' });
        });

        it('devrait retourner l\'utilisateur depuis la base de données si non présent dans le cache', async () => {
            redisClient.get.mockResolvedValue(null);
            User.findById.mockResolvedValue({ id: '123', email: 'test@example.com' });
            redisClient.setEx.mockResolvedValue();

            const result = await UserService.getUserWithCache('123');

            expect(redisClient.get).toHaveBeenCalledWith('user:123');
            expect(User.findById).toHaveBeenCalledWith('123');
            expect(redisClient.setEx).toHaveBeenCalledWith('user:123', 3600, JSON.stringify({ id: '123', email: 'test@example.com' }));
            expect(result).toEqual({ id: '123', email: 'test@example.com' });
        });
    });
});