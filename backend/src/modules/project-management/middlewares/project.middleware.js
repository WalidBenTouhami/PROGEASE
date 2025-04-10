// src/modules/project-management/middlewares/project.middleware.js
const mongoose = require('mongoose');
const User = require('../../user-management/models/user.model'); // Liaison avec user-management

exports.validateProject = async (req, res, next) => {
    const { title, description, equipe, tuteur, deliverables } = req.body;

    // 1. Titre requis
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Titre requis et non vide' });
    }

    // 2. Équipe valide
    if (!Array.isArray(equipe) || equipe.length < 1) {
        return res.status(400).json({ error: 'Équipe doit être un tableau non vide' });
    }

    // Vérifier que chaque membre de l'équipe existe en base
    try {
        const existingUsers = await User.find({ _id: { $in: equipe } });
        if (existingUsers.length !== equipe.length) {
            return res.status(400).json({ error: 'Membres d’équipe invalides' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Erreur lors de la validation des membres' });
    }

    // 3. Tuteur valide
    if (!tuteur) {
        return res.status(400).json({ error: 'Tuteur requis' });
    }

    // Vérifier que le tuteur existe et a le rôle 'tuteur'
    try {
        const tutor = await User.findById(tuteur);
        if (!tutor || tutor.role !== 'tuteur') {
            return res.status(400).json({ error: 'Tuteur invalide ou non trouvé' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

    // 4. Deliverables optionnelles mais structurées
    if (deliverables) {
        if (!Array.isArray(deliverables)) {
            return res.status(400).json({ error: 'Les deliverables doivent être un tableau' });
        }

        deliverables.forEach(deliverable => {
            if (!deliverable.name || !deliverable.deadline) {
                return res.status(400).json({ error: 'Chaque deliverable doit avoir "name" et "deadline"' });
            }
        });
    }

    // 5. Validation du statut (si envoyé)
    if (req.body.status && !['en cours', 'soumis', 'évalué', 'terminé'].includes(req.body.status)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }

    next();
};