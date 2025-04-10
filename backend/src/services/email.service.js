// src/services/email.service.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Charger les variables d'environnement

// Créer un transporteur Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Exemple avec Gmail
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendReminder = async (emails, subject, message) => {
    try {
        // Vérifier si les destinataires sont valides
        if (!Array.isArray(emails) || emails.length === 0) {
            throw new Error('Aucun destinataire spécifié');
        }

        // Configuration du message
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emails.join(','),
            subject: subject,
            text: message
        };

        // Envoyer l'email
        const result = await transporter.sendMail(mailOptions);
        return result.messageId; // Retourner un ID de confirmation
    } catch (error) {
        throw new Error(`Erreur d'envoi du rappel : ${error.message}`);
    }
};

