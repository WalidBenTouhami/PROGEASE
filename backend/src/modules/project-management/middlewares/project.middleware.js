// src/modules/project-management/middlewares/project.middleware.js

import mongoose from 'mongoose';
    import User from '../../user-management/models/user.model';

    export const validateProject = async (req, res, next) => {
        const { title, description, equipe, tuteur, deliverables, status } = req.body;

        try {
            // 1. Titre requis
            if (!title || title.trim() === '') {
                return res.status(400).json({ error: 'Titre requis et non vide' });
            }

            // 2. Équipe valide
            if (!Array.isArray(equipe) || equipe.length < 1) {
                return res.status(400).json({ error: 'Équipe doit être un tableau non vide' });
            }

            // Vérifier que chaque membre de l'équipe existe en base
            const existingUsers = await User.find({ _id: { $in: equipe } });
            if (existingUsers.length !== equipe.length) {
                return res.status(400).json({ error: 'Membres d’équipe invalides' });
            }

            // 3. Tuteur valide
            if (!tuteur) {
                return res.status(400).json({ error: 'Tuteur requis' });
            }

            const tutor = await User.findById(tuteur);
            if (!tutor || tutor.role !== 'tuteur') {
                return res.status(400).json({ error: 'Tuteur invalide ou non trouvé' });
            }

            // 4. Deliverables optionnelles mais structurées
            if (deliverables) {
                if (!Array.isArray(deliverables)) {
                    return res.status(400).json({ error: 'Les deliverables doivent être un tableau' });
                }

                for (const deliverable of deliverables) {
                    if (!deliverable.name || !deliverable.deadline) {
                        return res.status(400).json({ error: 'Chaque deliverable doit avoir "name" et "deadline"' });
                    }
                }
            }

            // 5. Validation du statut (si envoyé)
            if (status && !['en cours', 'soumis', 'évalué', 'terminé'].includes(status)) {
                return res.status(400).json({ error: 'Statut invalide' });
            }

            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    export const verifyToken = (req, res, next) => {
        // Logique de vérification du token
    };