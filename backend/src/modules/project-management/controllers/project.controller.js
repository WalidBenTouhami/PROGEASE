// src/modules/project-management/controllers/project.controller.js
import Project from '../models/project.model';
import User from '../../user-management/models/user.model';
import Evaluation from '../../evaluation-system/models/evaluation.model';
import * as IaService from '../../../services/ia.service';
import { graphqlCreateProjectSchema } from '../schema'; // Joi schema

export const createProject = async (req, res) => {
    try {
        const { error } = graphqlCreateProjectSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ errors: error.details.map(e => e.message) });

        const { titre, description, equipe, tuteur, skills, deliverables } = req.body;
        const tutor = await User.findById(tuteur);
        if (!tutor) return res.status(400).json({ error: 'Tuteur invalide.' });

        const teamMembers = await User.find({ _id: { $in: equipe } });
        if (teamMembers.length !== equipe.length) return res.status(400).json({ error: 'Équipe invalide.' });

        const newProject = new Project({
            titre,
            description,
            equipe,
            tuteur,
            skills,
            deliverables
        });
        await newProject.save();

        await Promise.all([
            IaService.trackProgress(newProject._id),
            IaService.predictPerformance(newProject._id),
            IaService.setupReminders(newProject._id)
        ]);

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};