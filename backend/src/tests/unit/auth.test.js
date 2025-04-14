// src/tests/unit/auth.test.js

import { jest } from '@jest/globals';
import { authService } from '../../modules/auth/services/auth.service.js';
import { User } from '../../modules/user-management/models/user.model.js';

jest.mock('../../modules/user-management/models/user.model.js');

describe('Authentication Service', () => {
    beforeEach(() => {
        User.findOne.mockClear();
    });

    test('Login with valid credentials', async () => {
        const mockUser = {
            _id: '1',
            email: 'test@example.com',
            comparePassword: jest.fn().mockResolvedValue(true)
        };

        User.findOne.mockResolvedValue(mockUser);

        const result = await authService.login('test@example.com', 'validPassword');

        expect(result).toHaveProperty('token');
        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    test('Login with invalid credentials', async () => {
        User.findOne.mockResolvedValue(null);

        await expect(authService.login('invalid@example.com', 'wrong'))
            .rejects
            .toThrow('Identifiants invalides');
    });

    test('Password strength validation', async () => {
        const weakPassword = 'password123';
        const strongPassword = 'Str0ngP@ss!';

        await expect(authService.register({ password: weakPassword }))
            .rejects
            .toThrow('Le mot de passe doit contenir au moins 8 caractères');

        await expect(authService.register({ password: strongPassword }))
            .resolves
            .toHaveProperty('user');
    });
});