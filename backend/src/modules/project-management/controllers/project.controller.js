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
            return res.status(400).json({ error: 'Membres d’équipe invalides' });
        }

        const newProject = new Project({ titre, description, equipe, tuteur, skills });
        await newProject.save();

        // 🤖 Services IA après création
        await IaService.trackProgress(newProject._id);
        await IaService.predictPerformance(newProject._id);
        await IaService.setupReminders(newProject._id);

        return res.status(201).json(newProject);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// 🔍 GET: Tous les projets
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('equipe', 'nom prenom')
            .populate('tuteur', 'nom prenom')
            .populate('evaluations');

        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// 📥 POST: Ajouter un livrable
exports.addDeliverable = async (req, res) => {
    try {
        const { name, deadline, repositoryUrl } = req.body;
        const projectId = req.params.projectId;

        const newDeliverable = await projectService.addDeliverableToProject(projectId, {
            name,
            deadline,
            repositoryUrl
        });

        return res.status(201).json({
            message: 'Livrable ajouté avec succès',
            deliverable: newDeliverable
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur lors de l’ajout du livrable',
            error: error.message
        });
    }
};

// 🧠 POST: Ajouter une évaluation à un projet
exports.addEvaluation = async (req, res) => {
    try {
        const { projectId, evaluationId } = req.body;

        const project = await Project.findById(projectId);
        const evaluation = await Evaluation.findById(evaluationId);

        if (!project || !evaluation) {
            return res.status(404).json({ error: 'Projet ou évaluation non trouvé' });
        }

        if (project.evaluations.includes(evaluation._id)) {
            return res.status(400).json({ error: 'Évaluation déjà ajoutée' });
        }

        project.evaluations.push(evaluation._id);
        await project.save();

        return res.status(200).json({ message: 'Évaluation ajoutée', project });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ⚙️ POST: Appariement intelligent d’un tuteur via IA
exports.assignSmartTutor = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const bestTutor = await IaService.matchTutor(projectId);

        if (!bestTutor) {
            return res.status(400).json({ error: 'Aucun tuteur disponible' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { tuteur: bestTutor._id },
            { new: true }
        ).populate('tuteur');

        return res.status(200).json({
            message: 'Tuteur assigné',
            tutor: updatedProject.tuteur
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// 🔍 GET: Livrables d’un projet
exports.getDeliverables = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const project = await projectService.getProjectById(projectId);

        if (!project) return res.status(404).json({ message: 'Projet non trouvé' });

        return res.status(200).json({ deliverables: project.deliverables });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// ✏️ PUT: Mettre à jour un livrable
exports.updateDeliverable = async (req, res) => {
    try {
        const { deliverableId } = req.params;
        const updateData = req.body;

        const updated = await projectService.updateDeliverable(
            req.params.projectId,
            deliverableId,
            updateData
        );

        return res.status(200).json({
            message: 'Livrable mis à jour',
            deliverable: updated
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur de mise à jour', error: error.message });
    }
};

// ❌ DELETE: Supprimer un livrable
exports.deleteDeliverable = async (req, res) => {
    try {
        const { deliverableId } = req.params;

        await projectService.deleteDeliverable(req.params.projectId, deliverableId);

        return res.status(200).json({ message: 'Livrable supprimé avec succès' });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur suppression', error: error.message });
    }
};

// ✅ POST: Vérification automatique de l’URL GitHub
exports.validateGithubRepo = async (req, res) => {
    try {
        const { url } = req.body;
        const isValid = await checkGithubRepoExists(url);

        if (isValid) {
            return res.status(200).json({ valid: true, message: 'Repo GitHub valide' });
        } else {
            return res.status(404).json({ valid: false, message: 'Repo GitHub introuvable' });
        }
    } catch (err) {
        return res.status(500).json({ valid: false, error: err.message });
    }
};
