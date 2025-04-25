// src/models/user.model.js

const mongoose = require('mongoose');
            const bcrypt = require('bcrypt');
            const { SecurityConfig, Enums } = require('../../config/constants'); // Importation de Enums
            const RoleEnum = Enums.UserRole; // Accès à UserRole depuis Enums

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
                    enum: Object.values(RoleEnum), // Utilisation correcte de RoleEnum
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
                        try {
                            return await bcrypt.compare(candidatePassword, this.password);
                        } catch (error) {
                            throw new Error('Erreur lors de la comparaison des mots de passe.');
                        }
                    },

                    isLocked() {
                        return this.lockUntil && this.lockUntil > Date.now();
                    }
                }
            });

            userSchema.pre('save', async function(next) {
                if (!this.isModified('password')) return next();

                try {
                    const salt = await bcrypt.genSalt(SecurityConfig.PASSWORD.SALT_ROUNDS);
                    this.password = await bcrypt.hash(this.password, salt);
                    next();
                } catch (error) {
                    next(new Error('Erreur lors du hachage du mot de passe.'));
                }
            });

            userSchema.index({ email: 1, role: 1 });

            module.exports = mongoose.model('User', userSchema);