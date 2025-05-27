// src/services/ai.service.js
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('../utils/logger');

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validation de la clé API
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
  const error = 'La variable DEEPSEEK_API_KEY est manquante';
  logger.error(`❌ ${error}`);
  throw new Error(error);
}

logger.info('✅ Clé API Deepseek chargée');

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

// Configuration des modèles IA
const CONFIG = {
  MODEL: process.env.AI_MODEL || 'deepseek-chat',
  MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
  TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  RETRY_LIMIT: parseInt(process.env.AI_RETRY_LIMIT || '3', 10),
  RETRY_DELAY: parseInt(process.env.AI_RETRY_DELAY || '1000', 10)
};

/**
 * Attends un délai spécifié
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gère les erreurs dans le processus IA avec logging détaillé
 * @param {Error} erreur - L'erreur rencontrée
 * @param {string} prompt - Le prompt ayant généré l'erreur
 * @param {any} reponse - La réponse éventuelle de l'API
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
    logger.error('❌ Réponse IA partielle:', {
      response: typeof reponse === 'string'
          ? reponse.substring(0, 500)
          : JSON.stringify(reponse).substring(0, 500)
    });
  }

  throw new Error(`Échec de traitement IA: ${erreur.message}`);
}

/**
 * Génère du texte avec l'API Deepseek avec gestion des retries
 * @param {string} prompt - Le prompt à envoyer à l'IA
 * @returns {Promise<string>} - Texte généré
 * @throws {Error} - Si la génération échoue après les retries
 */
async function genererTexte(prompt) {
  let retries = 0;
  let lastError = null;

  while (retries < CONFIG.RETRY_LIMIT) {
    try {
      logger.debug(`Appel à l'API Deepseek (tentative ${retries + 1}/${CONFIG.RETRY_LIMIT})`, {
        modelUsed: CONFIG.MODEL,
        promptLength: prompt.length,
        maxTokens: CONFIG.MAX_TOKENS
      });

      const response = await client.post('/chat/completions', {
        model: CONFIG.MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: CONFIG.MAX_TOKENS,
        temperature: CONFIG.TEMPERATURE,
        stream: false,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      // Validation de la réponse de l'API
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Structure de réponse API inattendue');
      }

      return response.data.choices[0].message.content.trim();
    } catch (erreur) {
      lastError = erreur;
      retries++;

      // Log l'erreur de tentative
      logger.warn(`Échec de la tentative ${retries}/${CONFIG.RETRY_LIMIT}: ${erreur.message}`);

      // Si nous avons atteint la limite de tentatives, propager l'erreur
      if (retries >= CONFIG.RETRY_LIMIT) {
        await gererErreurIA(lastError, prompt);
        break;
      }

      // Attente exponentielle entre les tentatives
      const backoffMs = Math.pow(2, retries) * CONFIG.RETRY_DELAY;
      logger.warn(`Nouvelle tentative dans ${backoffMs}ms...`);
      await sleep(backoffMs);
    }
  }

  // Cette ligne ne devrait jamais être atteinte grâce au throw dans gererErreurIA
  throw new Error("Échec de génération de texte après plusieurs tentatives");
}

/**
 * Parse une chaîne JSON avec gestion d'erreurs
 * @param {string} reponse - Chaîne JSON à parser
 * @returns {any} - Objet JS résultant
 * @throws {Error} - Si le parsing échoue
 */
function validerReponseJSON(reponse) {
  try {
    return JSON.parse(reponse);
  } catch (erreur) {
    logger.warn('Échec de parsing JSON direct', {
      error: erreur.message,
      responsePreview: reponse.substring(0, 100)
    });
    throw new Error('La réponse de l\'IA n\'est pas un JSON valide');
  }
}

/**
 * Tente d'extraire du JSON depuis une réponse textuelle
 * @param {string} reponse - Texte contenant potentiellement du JSON
 * @returns {any} - Objet JS extrait
 * @throws {Error} - Si l'extraction échoue
 */
function extraireJSONDepuisReponse(reponse) {
  try {
    // Stratégie 1: Rechercher un objet JSON complet
    const jsonRegex = /{[\s\S]*?}(?=\s*$)/;
    const matches = reponse.match(jsonRegex);

    if (matches && matches[0]) {
      return JSON.parse(matches[0]);
    }

    // Stratégie 2: Chercher entre délimiteurs de code
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const codeMatches = reponse.match(codeBlockRegex);

    if (codeMatches && codeMatches[1]) {
      return JSON.parse(codeMatches[1]);
    }

    // Stratégie 3: Approche plus agressive - prendre tout ce qui ressemble à du JSON
    const lastDitchAttempt = reponse.match(/{[\s\S]*}/);
    if (lastDitchAttempt && lastDitchAttempt[0]) {
      return JSON.parse(lastDitchAttempt[0]);
    }

    throw new Error('Aucun JSON trouvé dans la réponse');
  } catch (erreur) {
    logger.error('Échec d\'extraction JSON', {
      error: erreur.message,
      responsePreview: reponse.substring(0, 300)
    });
    throw new Error('Impossible d\'extraire le JSON de la réponse IA');
  }
}

/**
 * Traite une requête IA et tente d'extraire un résultat JSON
 * @param {string} prompt - Le prompt à envoyer
 * @returns {Promise<any>} - Objet JS résultant
 */
async function traiterReponseIA(prompt) {
  logger.info('Traitement d\'une requête IA', {
    promptLength: prompt.length,
    model: CONFIG.MODEL
  });

  const reponse = await genererTexte(prompt);

  try {
    // Tentative directe de parsing JSON
    return validerReponseJSON(reponse);
  } catch (erreur) {
    // Si échec, tenter l'extraction
    logger.warn('⚠️ Tentative d\'extraction JSON depuis la réponse IA');
    return extraireJSONDepuisReponse(reponse);
  }
}

/**
 * Analyse d'un projet avec l'IA
 * @param {Object} donnees - Données du projet à analyser
 * @returns {Promise<Object>} - Résultats de l'analyse
 */
async function analyserProjet(donnees) {
  try {
    logger.info('Analyse de projet en cours', {
      dataSize: JSON.stringify(donnees).length
    });

    // Préparation d'un prompt structuré
    const prompt = `
            Analyser le projet suivant et fournir des recommandations :
            
            ${JSON.stringify(donnees, null, 2)}
            
            Points à analyser :
            1. Risques potentiels
            2. Points d'amélioration
            3. Recommandations
            4. Estimation de la progression
            5. Prochaines étapes suggérées
            
            FORMAT: Fournir la réponse sous forme de texte structuré.
        `;

    const response = await genererTexte(prompt);

    return {
      analyse: response,
      timestamp: new Date(),
      status: 'success'
    };
  } catch (error) {
    logger.error('Erreur lors de l\'analyse du projet :', error);
    throw new Error('Échec de l\'analyse du projet : ' + error.message);
  }
}

/**
 * Calcule le suivi de progression basé sur les tâches
 * @param {Array} taches - Liste des tâches à analyser
 * @returns {Object} - Statistiques de progression
 */
async function suiviProgression(taches) {
  // Validation
  if (!Array.isArray(taches)) {
    throw new Error('Le paramètre taches doit être un tableau');
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
      t.statut === 'terminée' ||
      t.statut === 'complété' ||
      t.statut === 'Terminé'
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
 * Prédit la performance basée sur l'historique
 * @param {Array<number>} historique - Durées des tâches précédentes
 * @returns {Object} - Prédictions de performance
 */
async function predirePerformance(historique) {
  // Validation
  if (!Array.isArray(historique) || historique.length === 0) {
    throw new Error('Un historique non vide est requis pour la prédiction de performance');
  }

  // Calcul simple de la moyenne
  const tempsMoyen = historique.reduce((s, t) => s + t, 0) / historique.length;

  // Calcul de l'écart-type pour estimer l'incertitude
  const sommeEcartsCarres = historique.reduce((s, t) => s + Math.pow(t - tempsMoyen, 2), 0);
  const ecartType = Math.sqrt(sommeEcartsCarres / historique.length);

  // Calcul de la tendance (amélioration ou détérioration)
  const moitieTaille = Math.floor(historique.length / 2);
  const premiereMoitie = historique.slice(0, moitieTaille);
  const secondeMoitie = historique.slice(-moitieTaille);

  const moyennePremiere = premiereMoitie.reduce((s, t) => s + t, 0) / premiereMoitie.length;
  const moyenneSeconde = secondeMoitie.reduce((s, t) => s + t, 0) / secondeMoitie.length;

  const tendance = moyenneSeconde < moyennePremiere ? 'amélioration' : 'détérioration';
  const tauxVariation = Math.abs((moyenneSeconde - moyennePremiere) / moyennePremiere) * 100;

  return {
    tempsMoyenRealisation: tempsMoyen.toFixed(2),
    ecartType: ecartType.toFixed(2),
    tendance,
    tauxVariation: tauxVariation.toFixed(1) + '%',
    estimation: `${tempsMoyen.toFixed(1)} ± ${ecartType.toFixed(1)} heures`,
    prediction: `Temps estimé pour la prochaine tâche: ${tempsMoyen.toFixed(2)} heures avec tendance à l'${tendance}.`
  };
}

/**
 * Génère un planning optimisé en fonction des priorités et durées
 * @param {Array<Object>} taches - Liste des tâches avec priorité et durée
 * @returns {Array<Object>} - Planning optimisé
 */
async function genererPlanning(taches) {
  // Validation
  if (!Array.isArray(taches) || taches.length === 0) {
    throw new Error('Liste de tâches vide. Impossible de générer un planning.');
  }

  // Vérifier que chaque tâche a priorité et durée
  const tachesInvalides = taches.filter(t =>
      typeof t.priorite === 'undefined' || typeof t.duree === 'undefined'
  );

  if (tachesInvalides.length > 0) {
    throw new Error('Certaines tâches n\'ont pas de priorité ou de durée définie.');
  }

  // Tri par priorité décroissante (plus la priorité est élevée, plus tôt la tâche est planifiée)
  const tachesTriees = [...taches].sort((a, b) => b.priorite - a.priorite);

  // Calcul des heures de début et fin pour chaque tâche
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
 * Forme des équipes optimisées en fonction des compétences et affinités
 * @param {Array<Object>} membres - Liste des membres avec leurs compétences
 * @returns {Promise<Array<Object>>} - Équipes optimisées
 */
async function creerEquipes(membres) {
  // Validation
  if (!Array.isArray(membres) || membres.length === 0) {
    throw new Error('Liste de membres vide. Impossible de créer les équipes.');
  }

  // Utilisation de l'IA pour former les équipes
  const prompt = `
        Forme des équipes optimisées en fonction des compétences, disponibilités et préférences suivantes.
        
        Données des membres:
        ${JSON.stringify(membres, null, 2)}
        
        Contraintes:
        - Distribuer les compétences équitablement
        - Equilibrer le niveau d'expérience dans chaque équipe
        - Respecter les préférences de collaboration si spécifiées
        - Former des équipes de taille similaire
        
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
 * Association optimale tuteurs-projets basée sur les compétences
 * @param {Array<Object>} membres - Liste des membres à associer
 * @returns {Promise<Array<Object>>} - Associations optimales
 */
async function associerTuteurs(membres) {
  // Validation
  if (!Array.isArray(membres) || membres.length === 0) {
    throw new Error('Liste de membres vide. Impossible d\'associer les tuteurs.');
  }

  // Utilisation de l'IA pour associer tuteurs et équipes
  const prompt = `
        Associe les tuteurs et les équipes selon leurs compétences et besoins.
        
        Données des membres et tuteurs:
        ${JSON.stringify(membres, null, 2)}
        
        Contraintes:
        - Un tuteur doit avoir au moins une compétence correspondant au projet
        - Équilibrer la charge des tuteurs
        - Maximiser la compatibilité thématique entre tuteurs et projets
        - Tenir compte des disponibilités
        
        Retourne uniquement un objet JSON avec le format suivant:
        {
          "associations": [
            {
              "equipe": "equipe1",
              "tuteur": "tuteur3",
              "raisonAssociation": "Expertise en développement web et base de données",
              "scoreCompatibilite": 0.85
            },
            ...
          ]
        }
    `;

  return await traiterReponseIA(prompt);
}

/**
 * Recommande des ressources d'apprentissage pour des compétences
 * @param {Array<string>} competences - Liste des compétences
 * @returns {Promise<Object>} - Ressources recommandées
 */
async function recommanderApprentissage(competences) {
  // Validation
  if (!Array.isArray(competences) || competences.length === 0) {
    throw new Error('Liste de compétences vide. Impossible de recommander des ressources.');
  }

  // Utilisez l'IA pour générer des recommandations personnalisées
  const prompt = `
        Recommande des ressources d'apprentissage pour les compétences suivantes: 
        ${competences.join(', ')}.
        
        Pour chaque compétence, recommande:
        - 1 cours en ligne (avec lien fictif mais réaliste)
        - 1 livre de référence
        - 1 projet pratique pour s'exercer
        - 1 communauté en ligne pour obtenir de l'aide
        
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

// Exportation des fonctions du service
module.exports = {
  analyserProjet,
  genererTexte,
  suiviProgression,
  predirePerformance,
  genererPlanning,
  creerEquipes,
  associerTuteurs,
  recommanderApprentissage,
};
