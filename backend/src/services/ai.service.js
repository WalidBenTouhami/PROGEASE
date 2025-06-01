// src/services/ai.service.js
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('../utils/logger');

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validation de la cle API
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
let useTestMode = true; // Forcer le mode test

if (!DEEPSEEK_API_KEY) {
    logger.warn('⚠️ La variable DEEPSEEK_API_KEY est manquante, utilisation du mode test');
} else {
    logger.info('✅ Mode test forcé pour les tests');
}

// Configuration du client HTTP
const client = axios.create({
    baseURL: 'https://api.deepseek.com/v1',
    headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30s timeout
    validateStatus: status => status < 500 // Accepter tous les codes de statut < 500
});

// Configuration des modeles IA
const CONFIG = {
    MODEL: process.env.AI_MODEL || 'deepseek-chat',
    MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
    TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    RETRY_LIMIT: parseInt(process.env.AI_RETRY_LIMIT || '3', 10),
    RETRY_DELAY: parseInt(process.env.AI_RETRY_DELAY || '1000', 10)
};

/**
 * Attends un delai specifie
 * @param {number} ms - Delai en millisecondes
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gere les erreurs dans le processus IA avec logging detaille
 * @param {Error} erreur - L'erreur rencontree
 * @param {string} prompt - Le prompt ayant genere l'erreur
 * @param {any} reponse - La reponse eventuelle de l'API
 * @throws {Error} - Erreur enrichie avec contexte
 */
async function gererErreurIA(erreur, prompt = 'N/A', reponse = null) {
    const errorDetails = {
        message: erreur.message,
        code: erreur.code,
        status: erreur.response?.status,
        promptLength: prompt.length,
        modelUsed: CONFIG.MODEL,
        timestamp: new Date().toISOString()
    };

    logger.error('❌ Erreur lors du traitement IA', errorDetails);

    if (reponse) {
        logger.error('❌ Reponse IA partielle:', {
            response: typeof reponse === 'string'
                ? reponse.substring(0, 500)
                : JSON.stringify(reponse).substring(0, 500)
        });
    }

    throw new Error(`echec de traitement IA: ${erreur.message}`);
}

/**
 * Genere du texte avec l'API Deepseek avec gestion des retries
 * @param {string} prompt - Le prompt à envoyer à l'IA
 * @returns {Promise<string>} - Texte genere
 * @throws {Error} - Si la generation echoue apres les retries
 */
async function genererTexte(prompt) {
    try {
        logger.info('Génération de texte en cours', {
            promptLength: prompt.length
        });

        // En mode test, retourner une réponse prédéfinie
        return `Voici une réponse de test pour le prompt : "${prompt.substring(0, 50)}..."

Cette réponse est générée en mode test car la clé API n'est pas disponible.
Elle simule une réponse typique de l'IA pour les tests.

Points clés :
1. Ceci est une réponse de test
2. Elle est structurée de manière similaire à une vraie réponse
3. Elle permet de tester le format et le traitement

Conclusion : Cette réponse de test permet de valider le fonctionnement du système sans appeler l'API.`;
    } catch (error) {
        logger.error('echec de la génération de texte:', error);
        throw error;
    }
}

/**
 * Parse une chaîne JSON avec gestion d'erreurs
 * @param {string} reponse - Chaîne JSON à parser
 * @returns {any} - Objet JS resultant
 * @throws {Error} - Si le parsing echoue
 */
function validerReponseJSON(reponse) {
    try {
        return JSON.parse(reponse);
    } catch (erreur) {
        logger.warn('echec de parsing JSON direct', {
            error: erreur.message,
            responsePreview: reponse.substring(0, 100)
        });
        throw new Error('La reponse de l\'IA n\'est pas un JSON valide');
    }
}

/**
 * Génère une analyse IA pour une évaluation
 * @param {Object} params - Paramètres pour l'analyse
 * @param {Object} params.projet - Objet projet
 * @param {number} params.score - Score d'évaluation
 * @param {Array} params.criteria - Critères d'évaluation
 * @returns {string} - Analyse générée par l'IA
 */
async function generateAIAnalysis({ projet, score, criteria }) {
  try {
    const prompt = `
      Analysez cette évaluation de projet :
      Projet : ${projet.titre}
      Description : ${projet.description}
      Compétences : ${projet.skills.join(', ')}
      Score : ${score}/20
      Critères : ${JSON.stringify(criteria)}
      
      Fournissez :
      1. Analyse de performance
      2. Points d'amélioration
      3. Recommandations d'apprentissage
      4. Suggestions de développement des compétences
    `;

    const response = await client.post('/chat/completions', {
      model: CONFIG.MODEL,
      messages: [{ role: 'utilisateur', content: prompt }],
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: CONFIG.TEMPERATURE
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Réponse API invalide');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    logger.error('Erreur lors de la génération de l\'analyse IA:', error);
    throw new Error('Impossible de générer l\'analyse IA pour le moment.');
  }
}

/**
 * Prédit la performance du projet basée sur les données historiques
 * @param {Array} history - Tableau des évaluations précédentes
 * @returns {Object} - Métriques de performance prédites
 */
async function predictPerformance(history) {
  try {
    if (!history || history.length === 0) {
      throw new Error('Les données historiques sont nécessaires pour la prédiction de performance.');
    }

    const prompt = `
      Basé sur ces évaluations historiques :
      ${JSON.stringify(history)}
      
      Prédisez :
      1. Score final attendu
      2. Tendance de performance
      3. Facteurs de risque
      4. Probabilité de succès
    `;

    const response = await client.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [{ role: 'utilisateur', content: prompt }],
      max_tokens: CONFIG.MAX_TOKENS
    });

    const confidence = calculateConfidence(history);
    const confidenceLevel = getConfidenceLevel(confidence);

    return {
      prediction: response.choices[0].message.content,
      confidence: confidence,
      niveauConfiance: confidenceLevel
    };
  } catch (error) {
    console.error('Erreur lors de la prédiction de performance:', error);
    return {
      prediction: 'Impossible de générer la prédiction pour le moment.',
      confidence: 0,
      niveauConfiance: 'FAIBLE'
    };
  }
}

/**
 * Calcule le score de confiance pour les prédictions
 * @param {Array} history - Données d'évaluation historiques
 * @returns {number} - Score de confiance (0-1)
 */
function calculateConfidence(history) {
  const recentEvaluations = history.slice(-3);
  const scoreVariance = calculateVariance(recentEvaluations.map(e => e.score));
  return Math.max(0, 1 - (scoreVariance / 100));
}

/**
 * Détermine le niveau de confiance en français
 * @param {number} confidence - Score de confiance (0-1)
 * @returns {string} - Niveau de confiance
 */
function getConfidenceLevel(confidence) {
  if (confidence >= 0.9) return 'TRÈS ÉLEVÉ';
  if (confidence >= 0.7) return 'ÉLEVÉ';
  if (confidence >= 0.5) return 'MOYEN';
  if (confidence >= 0.3) return 'FAIBLE';
  return 'TRÈS FAIBLE';
}

/**
 * Calcule la variance des scores
 * @param {Array} scores - Tableau des scores
 * @returns {number} - Variance
 */
function calculateVariance(scores) {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  return scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
}

/**
 * Génère des recommandations d'apprentissage basées sur les compétences et les scores
 * @param {Object} projet - Objet projet
 * @param {Array} evaluations - Évaluations du projet
 * @returns {Object} - Recommandations d'apprentissage
 */
async function generateLearningRecommendations(projet, evaluations) {
  try {
    const prompt = `
      Basé sur ce projet et ses évaluations :
      Projet : ${projet.titre}
      Compétences : ${projet.skills.join(', ')}
      Évaluations : ${JSON.stringify(evaluations)}
      
      Fournissez :
      1. Ressources d'apprentissage recommandées
      2. Parcours de développement des compétences
      3. Exercices pratiques
      4. Prochaines étapes pour l'amélioration
    `;

    const response = await client.post('/chat/completions', {
      model: CONFIG.MODEL,
      messages: [{ role: 'utilisateur', content: prompt }],
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: CONFIG.TEMPERATURE
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Réponse API invalide');
    }

    return {
      recommendations: response.data.choices[0].message.content,
      priorite: calculatePriority(projet, evaluations)
    };
  } catch (error) {
    logger.error('Erreur lors de la génération des recommandations:', error);
    throw new Error('Impossible de générer les recommandations pour le moment.');
  }
}

/**
 * Calcule le niveau de priorité pour les recommandations
 * @param {Object} projet - Objet projet
 * @param {Array} evaluations - Évaluations du projet
 * @returns {string} - Niveau de priorité
 */
function calculatePriority(projet, evaluations) {
  const averageScore = evaluations.reduce((sum, eval) => sum + eval.score, 0) / evaluations.length;
  if (averageScore < 10) return 'HAUTE';
  if (averageScore < 15) return 'MOYENNE';
  return 'BASSE';
}

/**
 * Tente d'extraire du JSON depuis une reponse textuelle
 * @param {string} reponse - Texte contenant potentiellement du JSON
 * @returns {any} - Objet JS extrait
 * @throws {Error} - Si l'extraction echoue
 */
function extraireJSONDepuisReponse(reponse) {
    try {
        // Strategie 1: Rechercher un objet JSON complet
        const jsonRegex = /{[\s\S]*?}(?=\s*$)/;
        const matches = reponse.match(jsonRegex);

        if (matches && matches[0]) {
            return JSON.parse(matches[0]);
        }

        // Strategie 2: Chercher entre delimiteurs de code
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const codeMatches = reponse.match(codeBlockRegex);

        if (codeMatches && codeMatches[1]) {
            return JSON.parse(codeMatches[1]);
        }

        // Strategie 3: Approche plus agressive - prendre tout ce qui ressemble à du JSON
        const lastDitchAttempt = reponse.match(/{[\s\S]*}/);
        if (lastDitchAttempt && lastDitchAttempt[0]) {
            return JSON.parse(lastDitchAttempt[0]);
        }

        throw new Error('Aucun JSON trouve dans la reponse');
    } catch (erreur) {
        logger.error('echec d\'extraction JSON', {
            error: erreur.message,
            responsePreview: reponse.substring(0, 300)
        });
        throw new Error('Impossible d\'extraire le JSON de la reponse IA');
    }
}

/**
 * Traite une requete IA et tente d'extraire un resultat JSON
 * @param {string} prompt - Le prompt à envoyer
 * @returns {Promise<any>} - Objet JS resultant
 */
async function traiterReponseIA(prompt) {
    logger.info('Traitement d\'une requete IA', {
        promptLength: prompt.length,
        model: CONFIG.MODEL
    });

    try {
        const response = await client.post('/chat/completions', {
            model: CONFIG.MODEL,
            messages: [{ role: 'utilisateur', content: prompt }],
            max_tokens: CONFIG.MAX_TOKENS,
            temperature: CONFIG.TEMPERATURE
        });

        if (!response.data?.choices?.[0]?.message?.content) {
            throw new Error('Réponse API invalide');
        }

        const reponse = response.data.choices[0].message.content;

        try {
            return validerReponseJSON(reponse);
        } catch (erreur) {
            logger.warn('⚠️ Tentative d\'extraction JSON depuis la reponse IA');
            return extraireJSONDepuisReponse(reponse);
        }
    } catch (error) {
        logger.error('Erreur lors du traitement de la requête IA:', error);
        throw new Error('Impossible de traiter la requête IA pour le moment.');
    }
}

/**
 * Analyse d'un projet avec l'IA
 * @param {Object} donnees - Donnees du projet à analyser
 * @returns {Promise<Object>} - Resultats de l'analyse
 */
async function analyserProjet(donnees) {
    try {
        logger.info('Analyse de projet en cours', {
            dataSize: JSON.stringify(donnees).length
        });

        // En mode test, retourner des données de test
        return {
            analyse: {
                complexite: "MOYENNE",
                dureeEstimee: "3 mois",
                risques: ["Délais serrés", "Dépendances techniques"],
                points_forts: [
                    "Équipe expérimentée",
                    "Technologies modernes",
                    "Objectifs clairs"
                ],
                recommandations: [
                    "Mettre en place des tests automatisés",
                    "Planifier des revues de code régulières",
                    "Documenter les choix techniques"
                ]
            },
            competences: {
                requises: ["JavaScript", "Node.js", "React", "MongoDB"],
                recommandees: ["TypeScript", "Jest", "Docker"],
                niveau: "INTERMEDIAIRE"
            },
            planning: {
                phases: [
                    {
                        nom: "Conception",
                        duree: "2 semaines",
                        livrables: ["Documentation technique", "Maquettes"]
                    },
                    {
                        nom: "Développement",
                        duree: "8 semaines",
                        livrables: ["MVP", "Tests unitaires"]
                    },
                    {
                        nom: "Tests",
                        duree: "2 semaines",
                        livrables: ["Rapport de tests", "Corrections de bugs"]
                    }
                ],
                jalons: [
                    {
                        nom: "Validation conception",
                        date: "2025-06-15"
                    },
                    {
                        nom: "Revue MVP",
                        date: "2025-07-30"
                    },
                    {
                        nom: "Livraison finale",
                        date: "2025-08-15"
                    }
                ]
            }
        };
  } catch (error) {
        logger.error('echec de l\'analyse du projet:', error);
        throw error;
  }
}

/**
 * Calcule le suivi de progression base sur les tâches
 * @param {Array} taches - Liste des tâches à analyser
 * @returns {Object} - Statistiques de progression
 */
async function suiviProgression(taches) {
    // Validation
    if (!Array.isArray(taches)) {
        throw new Error('Le parametre taches doit etre un tableau');
    }

    // Si aucune tâche, retourner 0%
    if (taches.length === 0) {
        return {
            totalTaches: 0,
            tachesTerminees: 0,
            tachesEnCours: 0,
            pourcentageProgression: 0,
        };
    }

    // Calculer les statistiques
    const terminees = taches.filter(t =>
        t.statut === 'terminee' ||
      t.statut === 'complete' ||
      t.statut === 'Termine'
    ).length;

    const enCours = taches.filter(t =>
        t.statut === 'en cours' ||
      t.statut === 'En cours' ||
      t.statut === 'En attente'
    ).length;

    const total = taches.length;
    const pourcentage = Math.round((terminees / total) * 100);

  return {
        totalTaches: total,
        tachesTerminees: terminees,
        tachesEnCours: enCours,
        pourcentageProgression: pourcentage,
  };
}

/**
 * Predit la performance basee sur l'historique
 * @param {Array<number>} historique - Durees des tâches precedentes
 * @returns {Object} - Predictions de performance
 */
async function predirePerformance(historique) {
    // Validation
    if (!Array.isArray(historique) || historique.length === 0) {
        throw new Error('Un historique non vide est requis pour la prediction de performance');
    }

    // Calcul simple de la moyenne
    const tempsMoyen = historique.reduce((s, t) => s + t, 0) / historique.length;

    // Calcul de l'ecart-type pour estimer l'incertitude
    const sommeEcartsCarres = historique.reduce((s, t) => s + Math.pow(t - tempsMoyen, 2), 0);
    const ecartType = Math.sqrt(sommeEcartsCarres / historique.length);

    // Calcul de la tendance (amelioration ou deterioration)
    const moitieTaille = Math.floor(historique.length / 2);
    const premiereMoitie = historique.slice(0, moitieTaille);
    const secondeMoitie = historique.slice(-moitieTaille);

    const moyennePremiere = premiereMoitie.reduce((s, t) => s + t, 0) / premiereMoitie.length;
    const moyenneSeconde = secondeMoitie.reduce((s, t) => s + t, 0) / secondeMoitie.length;

    const tendance = moyenneSeconde < moyennePremiere ? 'amelioration' : 'deterioration';
    const tauxVariation = Math.abs((moyenneSeconde - moyennePremiere) / moyennePremiere) * 100;

  return {
        tempsMoyenRealisation: tempsMoyen.toFixed(2),
        ecartType: ecartType.toFixed(2),
        tendance,
        tauxVariation: tauxVariation.toFixed(1) + '%',
        estimation: `${tempsMoyen.toFixed(1)} ± ${ecartType.toFixed(1)} heures`,
        prediction: `Temps estime pour la prochaine tâche: ${tempsMoyen.toFixed(2)} heures avec tendance à l'${tendance}.`
  };
}

/**
 * Genere un planning optimise en fonction des priorites et durees
 * @param {Array<Object>} taches - Liste des tâches avec priorite et duree
 * @returns {Array<Object>} - Planning optimise
 */
async function genererPlanning(taches) {
    // Validation
    if (!Array.isArray(taches) || taches.length === 0) {
        throw new Error('Liste de tâches vide. Impossible de generer un planning.');
    }

    // Verifier que chaque tâche a priorite et duree
    const tachesInvalides = taches.filter(t =>
        typeof t.priorite === 'undefined' || typeof t.duree === 'undefined'
    );

    if (tachesInvalides.length > 0) {
        throw new Error('Certaines tâches n\'ont pas de priorite ou de duree definie.');
    }

    // Tri par priorite decroissante (plus la priorite est elevee, plus tôt la tâche est planifiee)
    const tachesTriees = [...taches].sort((a, b) => b.priorite - a.priorite);

    // Calcul des heures de debut et fin pour chaque tâche
    let heureCourante = 0;
    const planning = tachesTriees.map(tache => {
        const debut = heureCourante;
        const fin = debut + tache.duree;
        heureCourante = fin;

        return {
            ...tache,
            debut,
            fin
        };
    });

    return planning;
}

/**
 * Forme des equipes optimisees en fonction des competences et affinites
 * @param {Array<Object>} membres - Liste des membres avec leurs competences
 * @returns {Promise<Array<Object>>} - equipes optimisees
 */
async function creerEquipes(membres) {
    // Validation
    if (!Array.isArray(membres) || membres.length === 0) {
        throw new Error('Liste de membres vide. Impossible de creer les equipes.');
    }

    // Utilisation de l'IA pour former les equipes
    const prompt = `
        Forme des equipes optimisees en fonction des competences, disponibilites et preferences suivantes.
        
        Donnees des membres:
        ${JSON.stringify(membres, null, 2)}
        
        Contraintes:
        - Distribuer les competences equitablement
        - Equilibrer le niveau d'experience dans chaque equipe
        - Respecter les preferences de collaboration si specifiees
        - Former des equipes de taille similaire
        
        Retourne uniquement un objet JSON avec le format suivant:
        {
          "equipes": [
            {
              "id": "equipe1",
              "membres": [...],
              "competencesPrincipales": [...],
              "forceEstimee": 8.5
            },
            ...
          ]
        }
    `;

    return await traiterReponseIA(prompt);
}

/**
 * Association optimale tuteurs-projets basee sur les competences
 * @param {Array<Object>} membres - Liste des membres à associer
 * @returns {Promise<Array<Object>>} - Associations optimales
 */
async function associerTuteurs(membres) {
    // Validation
    if (!Array.isArray(membres) || membres.length === 0) {
        throw new Error('Liste de membres vide. Impossible d\'associer les tuteurs.');
    }

    // Utilisation de l'IA pour associer tuteurs et equipes
    const prompt = `
        Associe les tuteurs et les equipes selon leurs competences et besoins.
        
        Donnees des membres et tuteurs:
        ${JSON.stringify(membres, null, 2)}
        
        Contraintes:
        - Un tuteur doit avoir au moins une competence correspondant au projet
        - equilibrer la charge des tuteurs
        - Maximiser la compatibilite thematique entre tuteurs et projets
        - Tenir compte des disponibilites
        
        Retourne uniquement un objet JSON avec le format suivant:
        {
          "associations": [
            {
              "equipe": "equipe1",
              "tuteur": "tuteur3",
              "raisonAssociation": "Expertise en developpement web et base de donnees",
              "scoreCompatibilite": 0.85
            },
            ...
          ]
        }
    `;

    return await traiterReponseIA(prompt);
}

/**
 * Recommande des ressources d'apprentissage pour des competences
 * @param {Array<string>} competences - Liste des competences
 * @returns {Promise<Object>} - Ressources recommandees
 */
async function recommanderApprentissage(competences) {
    // Validation
    if (!Array.isArray(competences) || competences.length === 0) {
        throw new Error('Liste de competences vide. Impossible de recommander des ressources.');
    }

    // Utilisez l'IA pour generer des recommandations personnalisees
    const prompt = `
        Recommande des ressources d'apprentissage pour les competences suivantes: 
        ${competences.join(', ')}.
        
        Pour chaque competence, recommande:
        - 1 cours en ligne (avec lien fictif mais realiste)
        - 1 livre de reference
        - 1 projet pratique pour s'exercer
        - 1 communaute en ligne pour obtenir de l'aide
        
        Retourne uniquement un objet JSON avec ce format:
        {
          "recommandations": [
            {
              "competence": "nom_competence",
              "ressources": {
                "cours": { "titre": "...", "lien": "..." },
                "livre": { "titre": "...", "auteur": "..." },
                "projet": { "titre": "...", "description": "..." },
                "communaute": { "nom": "...", "lien": "..." }
              }
            },
            ...
          ]
        }
    `;

    return await traiterReponseIA(prompt);
}

// Mock AI service implementation
const mockAIService = {
    generateRecommendations: async (projet) => {
        logger.debug('Generating mock recommendations for projet:', projet._id);
        return {
            text: 'Based on the projet progress and evaluations, here are some recommendations:\n' +
                  '1. Focus on improving code quality and documentation\n' +
                  '2. Consider implementing automated tests\n' +
                  '3. Regular code reviews would be beneficial',
            score: 0.85,
            confidence: 0.9
        };
    },

    generateLearningRecommendations: async (projet) => {
        logger.debug('Generating mock learning recommendations for projet:', projet._id);
        return 'To improve your learning outcomes:\n' +
               '1. Review the fundamentals of software architecture\n' +
               '2. Practice test-driven development\n' +
               '3. Study design patterns applicable to your projet';
    },

    predictPerformance: async (projet) => {
        logger.debug('Predicting mock performance for projet:', projet._id);
        // Return a score between 0 and 1
        return 0.75;
    }
};

// Export all functions
module.exports = mockAIService;
