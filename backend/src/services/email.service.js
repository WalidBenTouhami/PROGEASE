// src/services/email.service.js

            import nodemailer from 'nodemailer';
            import { logger } from '../utils/logger.js';

            class EmailService {
                constructor() {
                    // ✅ Validation des variables d'environnement
                    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
                    requiredEnvVars.forEach((envVar) => {
                        if (!process.env[envVar]) {
                            logger.error(`La variable d'environnement ${envVar} doit être définie.`);
                            process.exit(1);
                        }
                    });

                    // 📌 Configuration du transporteur
                    this.transporter = nodemailer.createTransport({
                        host: process.env.EMAIL_HOST,
                        port: parseInt(process.env.EMAIL_PORT, 10),
                        secure: process.env.EMAIL_USE_TLS === 'true',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        },
                        pool: true,
                        maxConnections: 5,
                        rateLimit: 10
                    });
                }

                // 📌 Envoi d'un email basé sur un template
                async sendTemplateEmail(templateName, recipient, data) {
                    const templates = {
                        welcome: {
                            subject: 'Bienvenue sur Progease!',
                            text: `Bonjour ${data.name}, Bienvenue!`,
                            html: `<h1>Bienvenue ${data.name}!</h1>`
                        },
                        resetPassword: {
                            subject: 'Réinitialisation de mot de passe',
                            text: `Lien de réinitialisation: ${data.link}`,
                            html: `<a href="${data.link}">Réinitialiser</a>`
                        }
                    };

                    const template = templates[templateName];
                    if (!template) {
                        logger.error(`Template "${templateName}" introuvable.`);
                        throw new Error('Template introuvable');
                    }

                    return this.sendEmail({
                        to: recipient,
                        ...template
                    });
                }

                // 📌 Envoi d'un email générique
                async sendEmail({ to, subject, text, html }) {
                    try {
                        const info = await this.transporter.sendMail({
                            from: `"Progease" <${process.env.EMAIL_FROM}>`,
                            to,
                            subject,
                            text,
                            html,
                            headers: {
                                'X-Progease-Version': process.env.npm_package_version
                            }
                        });

                        logger.info(`Email envoyé avec succès: ${info.messageId}`);
                        return info;
                    } catch (error) {
                        logger.error(`Erreur lors de l'envoi de l'email à ${to}: ${error.message}`);
                        throw error;
                    }
                }
            }

            export default new EmailService();