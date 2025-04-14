// src/services/email.service.js

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
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
        if (!template) throw new Error('Template introuvable');

        return this.sendEmail({
            to: recipient,
            ...template
        });
    }

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

            logger.info(`Email envoyé: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error(`Erreur d'envoi email: ${error.message}`);
            throw error;
        }
    }
}

export default new EmailService();