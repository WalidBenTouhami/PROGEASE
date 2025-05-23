const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement depuis le fichier .env à la racine du projet
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  throw new Error('❌ La variable DEEPSEEK_API_KEY est manquante. Vérifiez votre fichier .env.');
}

console.log('✅ Clé API Deepseek chargée avec succès.');

const client = axios.create({
  baseURL: 'https://api.deepseek.com/v1',
  headers: {
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const CONFIG = {
  MODEL: 'deepseek-chat',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7
};

async function gererErreurIA(erreur, reponse = null) {
  console.error('❌ Erreur lors du traitement IA :', erreur.message);
  if (reponse) {
    console.error('❌ Réponse IA :', reponse);
  }
  throw new Error('La réponse de l\'IA est invalide ou n\'a pas pu être traitée.');
}

async function genererTexte(prompt) {
  try {
    const response = await client.post('/chat/completions', {
      model: CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: CONFIG.MAX_TOKENS,
      stream: false
    });
    return response.data.choices[0].message.content.trim();
  } catch (erreur) {
    await gererErreurIA(erreur);
  }
}

function validerReponseJSON(reponse) {
  try {
    return JSON.parse(reponse);
  } catch (erreur) {
    throw new Error('La réponse de l\'IA n\'est pas un JSON valide.');
  }
}

function extraireJSONDepuisReponse(reponse) {
  try {
    const matcheJSON = reponse.match(/{.*}/s);
    if (matcheJSON) {
      return JSON.parse(matcheJSON[0]);
    }
    throw new Error('Aucun JSON trouvé dans la réponse.');
  } catch (erreur) {
    throw new Error('Impossible d\'extraire le JSON de la réponse IA.');
  }
}

async function traiterReponseIA(prompt) {
  const reponse = await genererTexte(prompt);
  try {
    return validerReponseJSON(reponse);
  } catch (erreur) {
    console.warn('⚠️ Tentative d\'extraction JSON depuis la réponse IA.');
    return extraireJSONDepuisReponse(reponse);
  }
}

async function suiviProgression(taches) {
  const terminees = taches.filter(t => t.statut === 'terminée').length;
  const enCours = taches.filter(t => t.statut === 'en cours').length;
  const total = taches.length;

  const pourcentage = total > 0 ? Math.round((terminees / total) * 100) : 0;
  return {
    totalTaches: total,
    tachesTerminees: terminees,
    tachesEnCours: enCours,
    pourcentageProgression: pourcentage,
  };
}

async function predirePerformance(historique) {
  if (!historique || historique.length === 0) {
    throw new Error('❌ Un historique est requis pour la prédiction de performance.');
  }

  const tempsMoyen = historique.reduce((s, t) => s + t, 0) / historique.length;
  return {
    tempsMoyenRealisation: tempsMoyen.toFixed(2),
    prediction: `Temps estimé pour la prochaine tâche : ${tempsMoyen.toFixed(2)} heures.`,
  };
}

async function genererPlanning(taches) {
  if (!taches || taches.length === 0) {
    throw new Error('❌ La liste des tâches est vide. Impossible de générer un planning.');
  }

  return taches
      .sort((a, b) => b.priorite - a.priorite)
      .map((tache, index, tachesTriees) => {
        const debut = index === 0 ? 0 : tachesTriees[index - 1].fin;
        const fin = debut + tache.duree;
        return { ...tache, debut, fin };
      });
}

async function creerEquipes(membres) {
  if (!membres || membres.length === 0) {
    throw new Error('❌ La liste des membres est vide. Impossible de créer les équipes.');
  }
  const prompt = `Forme des équipes optimisées selon les compétences, disponibilités et préférences suivantes. Retourne seulement au format JSON : ${JSON.stringify(membres)}`;
  return traiterReponseIA(prompt);
}

async function associerTuteurs(membres) {
  if (!membres || membres.length === 0) {
    throw new Error('❌ La liste des membres est vide. Impossible d\'associer les tuteurs.');
  }
  const prompt = `Associe les mentors et mentorés selon leurs compétences et besoins. Retourne seulement au format JSON : ${JSON.stringify(membres)}`;
  return traiterReponseIA(prompt);
}

async function recommanderApprentissage(competences) {
  if (!competences || competences.length === 0) {
    throw new Error('❌ Liste des compétences vide. Impossible de recommander des ressources.');
  }
  const prompt = `Recommande des ressources d'apprentissage pour les compétences suivantes. Retourne seulement au format JSON : ${competences.join(', ')}`;
  return traiterReponseIA(prompt);
}

async function analyserProjet(donnees) {
  try {
    const prompt = `
      Analyser le projet suivant et fournir des recommandations :
      
      ${JSON.stringify(donnees, null, 2)}
      
      Points à analyser :
      1. Risques potentiels
      2. Points d'amélioration
      3. Recommandations
      4. Estimation de la progression
      5. Prochaines étapes suggérées
    `;

    const response = await client.post('/chat/completions', {
      model: CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: CONFIG.TEMPERATURE
    });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Réponse IA invalide');
    }

    return {
      analyse: response.data.choices[0].message.content,
      timestamp: new Date(),
      status: 'success'
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse du projet :', error);
    throw new Error('Échec de l\'analyse du projet : ' + error.message);
  }
}

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