// src/modules/project-management/routes/project.routes.js

import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { verifyToken } from '../middlewares/project.middleware.js';
import { predictPerformance } from '../services/project.service.js';

const router = Router();

// ─── Routes liées aux projets ───────────────────────────────────────

// 🆕 Créer un projet
router.post('/create', verifyToken, projectController.createProject);

// 🔍 Récupérer tous les projets
router.get('/all', verifyToken, projectController.getProjects);

// 🔍 Récupérer projets avec formations associées
router.get('/with-formations', verifyToken, projectController.getProjectsWithFormations);

// 🧠 Ajouter une évaluation à un projet
router.post('/:projectId/add-evaluation', verifyToken, projectController.addEvaluation);

// 🤖 Appariement automatique d’un tuteur à un projet
router.post('/:projectId/assign-tutor', verifyToken, projectController.assignSmartTutor);

// 🔮 Prédire la performance d’un projet (IA)
router.post('/:projectId/predict-performance', verifyToken, async (req, res) => {
    try {
        await predictPerformance(req.params.projectId);
        res.json({ message: 'Prédiction mise à jour' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Routes liées aux livrables ────────────────────────────────────

// 📥 Ajouter un livrable GitHub à un projet
router.post('/:projectId/deliverables', verifyToken, projectController.addDeliverable);

// 🔍 Récupérer tous les livrables d’un projet
router.get('/:projectId/deliverables', verifyToken, projectController.getDeliverables);

// ✏️ Modifier un livrable spécifique
router.put('/:projectId/deliverables/:deliverableId', verifyToken, projectController.updateDeliverable);

// ❌ Supprimer un livrable spécifique
router.delete('/:projectId/deliverables/:deliverableId', verifyToken, projectController.deleteDeliverable);

// 🔎 Vérifier un lien GitHub (ping public)
router.post('/validate-repo', verifyToken, projectController.validateGithubRepo);

export default router;