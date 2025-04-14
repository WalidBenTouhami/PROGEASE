// src/modules/project-management/controllers/project.controller.js
import Project from '../models/project.model';
import User from '../../user-management/models/user.model';
import * as IaService from '../../../services/ia.service';
import { graphqlCreateProjectSchema } from '../schema'; // Joi schema

export const createProject = async (req, res, next) => {
    try {
        // Validation des données d'entrée
        const { error } = graphqlCreateProjectSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(e => e.message) });
        }

        const { titre, description, equipe, tuteur, skills, deliverables } = req.body;

        // Vérification de l'existence du tuteur
        const tutor = await User.findById(tuteur).lean();
        if (!tutor) {
            return res.status(400).json({ error: 'Tuteur invalide.' });
        }

        // Vérification de l'existence des membres de l'équipe
        const teamMembers = await User.find({ _id: { $in: equipe } }).lean();
        if (teamMembers.length !== equipe.length) {
            return res.status(400).json({ error: 'Équipe invalide.' });
        }

        // Création du projet
        const newProject = await Project.create({
            titre,
            description,
            equipe,
            tuteur,
            skills,
            deliverables,
        });

        // Appels aux services IA
        await Promise.all([
            IaService.trackProgress(newProject._id),
            IaService.predictPerformance(newProject._id),
            IaService.setupReminders(newProject._id),
        ]);

        res.status(201).json(newProject);
    } catch (error) {
        next(error); // Utilisation d'un middleware pour gérer les erreurs
    }
};