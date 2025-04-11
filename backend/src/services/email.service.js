// src/services/email.service.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config(); // 📦 Charger les variables d'environnement (.env)

// ✅ Transporteur SMTP pour Microsoft 365 / Outlook
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // 🔓 STARTTLS (ne pas mettre true)
    auth: {
        user: process.env.EMAIL_USER, // ex: walid.bentouhami@esprit.tn
        pass: process.env.EMAIL_PASS  // ⚠️ mot de passe ou mot de passe d'application (si 2FA activé)
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

// ✅ Vérification de la connexion SMTP
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Erreur de configuration SMTP :', error);
    } else {
        console.log('✅ Transporteur email Microsoft 365 prêt');
    }
});

/**
 * ✉️ Envoie un email de rappel à plusieurs destinataires
 * @param {string[]} emails - Liste des adresses email (ex: ["x@esprit.tn", "y@esprit.tn"])
 * @param {string} subject - Sujet du message
 * @param {string} message - Corps du message (texte brut)
 * @returns {Promise<string>} - ID du message envoyé
 */
exports.sendReminder = async (emails, subject, message) => {
    try {
        // 🔎 Validation des paramètres
        if (!Array.isArray(emails) || emails.length === 0) {
            throw new Error('Aucun destinataire fourni.');
        }

        if (!subject || !message) {
            throw new Error('Le sujet et le message sont requis.');
        }

        // ✉️ Options du mail
        const mailOptions = {
            from: `"PROGEASE Notification" <${process.env.EMAIL_USER}>`,
            to: emails.join(','),
            subject: subject,
            text: message
        };

        // 🚀 Envoi
        const result = await transporter.sendMail(mailOptions);
        console.log(`📤 Email envoyé avec succès à ${emails.join(', ')} (ID: ${result.messageId})`);
        return result.messageId;

    } catch (err) {
        console.error('🚨 Erreur lors de l’envoi de l’email :', err.message);
        throw new Error(`Échec de l'envoi : ${err.message}`);
    }
};
