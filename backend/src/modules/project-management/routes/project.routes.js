import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { verifyToken } from '../middlewares/project.middleware.js';
import { predictPerformance } from '../services/project.service.js';

const router = Router();

// ─── Projet ───────────────────────────────────────

// 🆕 Créer un projet
router.post('/create', verifyToken, projectController.createProject);

// 🔍 Récupérer tous les projets
router.get('/all', verifyToken, projectController.getProjects);

// 🔍 Récupérer projets + formations
router.get('/with-formations', verifyToken, projectController.getProjectsWithFormations);

// 🧠 Ajouter une évaluation
router.post('/:projectId/add-evaluation', verifyToken, projectController.addEvaluation);

// 🤖 Appariement automatique d’un tuteur
router.post('/:projectId/assign-tutor', verifyToken, projectController.assignSmartTutor);

// 🔮 Prédire la performance (IA)
router.post('/:projectId/predict-performance', verifyToken, async (req, res) => {
    try {
        await predictPerformance(req.params.projectId);
        res.json({ message: 'Prédiction mise à jour' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Livrables ────────────────────────────────────

// 📥 Ajouter un livrable GitHub
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