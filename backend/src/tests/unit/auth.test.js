// src/tests/unit/auth.test.js

            import { jest } from '@jest/globals';
            import { authService } from '../../modules/auth/services/auth.service.js';
            import { User } from '../../modules/user-management/models/user.model.js';

            jest.mock('../../modules/user-management/models/user.model.js');

            describe('Authentication Service', () => {
                beforeEach(() => {
                    jest.clearAllMocks();
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

                test('Login with disabled user', async () => {
                    const mockUser = {
                        _id: '1',
                        email: 'test@example.com',
                        isActive: false,
                        comparePassword: jest.fn().mockResolvedValue(true)
                    };

                    User.findOne.mockResolvedValue(mockUser);

                    await expect(authService.login('test@example.com', 'validPassword'))
                        .rejects
                        .toThrow('Compte désactivé');
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

                test('Register with existing email', async () => {
                    User.findOne.mockResolvedValue({ email: 'test@example.com' });

                    await expect(authService.register({ email: 'test@example.com', password: 'Str0ngP@ss!' }))
                        .rejects
                        .toThrow('Email déjà utilisé');
                });

                test('Register with valid data', async () => {
                    User.findOne.mockResolvedValue(null);
                    User.create = jest.fn().mockResolvedValue({ _id: '1', email: 'new@example.com' });

                    const result = await authService.register({ email: 'new@example.com', password: 'Str0ngP@ss!' });

                    expect(result).toHaveProperty('user');
                    expect(result.user).toHaveProperty('email', 'new@example.com');
                    expect(User.create).toHaveBeenCalledWith({ email: 'new@example.com', password: 'Str0ngP@ss!' });
                });
            });