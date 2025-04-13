//src/modules/project-management/controllers/project.controller.js

const Project = require('../models/project.model');
const User = require('../../user-management/models/User.js');
const Evaluation = require('../../evaluation-system/models/Evaluation.js');
const projectService = require('../services/project.service');
const IaService = require('../../../services/ia.service');
const { checkGithubRepoExists } = require('../../../utils/github.util');

// 🔍 GET: Tous les projets avec formations + infos équipe/tuteur
exports.getProjectsWithFormations = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('equipe', 'nom prenom certifications')
            .populate('tuteur', 'nom prenom')
            .populate('evaluations');

        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// 🆕 POST: Créer un nouveau projet
exports.createProject = async (req, res) => {
    try {
        const { titre, description, equipe, tuteur, skills } = req.body;

        // Validation des membres
        const tutor = await User.findById(tuteur);
        if (!tutor) return res.status(400).json({ error: 'Tuteur invalide' });

        const teamMembers = await User.find({ _id: { $in: equipe } });
        if (teamMembers.length !== equipe.length) {
            return res.status(400).json({ error: 'Membres d\'équipe invalides' });
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
            message: 'Erreur lors de l\'ajout du livrable',
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

        project.evaluations.push(evaluation._id);
        await project.save();

        return res.status(200).json(project);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ⚙️ POST: Appariement intelligent d\'un tuteur via IA
exports.assignSmartTutor = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tutor = await IaService.matchTutor(projectId);
        
        await Project.findByIdAndUpdate(projectId, { tuteur: tutor._id });
        return res.status(200).json({ message: 'Tuteur assigné avec succès', tutor });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// 🔍 GET: Livrables d\'un projet
exports.getDeliverables = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId).select('deliverables');
        
        if (!project) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }

        return res.status(200).json(project.deliverables);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ✅ POST: Vérification automatique de l\'URL GitHub
exports.validateGithubRepo = async (req, res) => {
    try {
        const { repositoryUrl } = req.body;
        const exists = await checkGithubRepoExists(repositoryUrl);
        
        return res.status(200).json({ exists });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
