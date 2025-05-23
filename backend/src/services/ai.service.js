const deepseek = require('deepseek'); // Import the library
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  throw new Error('❌ DEEPSEEK_API_KEY est manquante. Veuillez vérifier votre fichier .env.');
}

console.log('✅ DEEPSEEK_API_KEY loaded successfully.');

const client = deepseek.createClient({ apiKey: DEEPSEEK_API_KEY });

// Configuration
const CONFIG = {
  MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 200,
};

/**
 * Utility to handle errors during AI calls.
 * Logs the error and rethrows it with a meaningful message.
 */
async function handleAIError(error, response = null) {
  console.error('❌ Error during AI processing:', error.message);
  if (response) {
    console.error('❌ AI Response:', response);
  }
  throw new Error('AI response is invalid or could not be processed.');
}

/**
 * Generates text based on a given prompt.
 * @param {string} prompt - The text prompt to send to the AI.
 * @returns {string} - The generated text response.
 */
async function generateText(prompt) {
  try {
    const response = await client.generateText({
      model: CONFIG.MODEL,
      prompt,
      maxTokens: CONFIG.MAX_TOKENS,
    });
    return response.text.trim();
  } catch (error) {
    await handleAIError(error);
  }
}

/**
 * Validates the AI response to ensure it is valid JSON.
 * @param {string} response - The response from the AI.
 * @returns {object} - The parsed JSON object.
 */
function validateJSONResponse(response) {
  try {
    return JSON.parse(response);
  } catch (error) {
    throw new Error('AI response is not valid JSON.');
  }
}

/**
 * Tries to extract JSON from a potentially invalid AI response.
 * @param {string} response - The AI response.
 * @returns {object} - The extracted JSON object.
 */
function extractJSONFromResponse(response) {
  try {
    const jsonMatch = response.match(/{.*}/s); // Match JSON object
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response.');
  } catch (error) {
    throw new Error('Failed to extract JSON from AI response.');
  }
}

/**
 * Processes an AI prompt and returns structured JSON.
 * Uses fallback logic to parse potentially invalid AI responses.
 * @param {string} prompt - The AI prompt.
 * @returns {object} - Parsed JSON response.
 */
async function processAIResponse(prompt) {
  const response = await generateText(prompt);
  try {
    return validateJSONResponse(response);
  } catch (error) {
    console.warn('⚠️ Falling back to JSON extraction.');
    return extractJSONFromResponse(response);
  }
}

/**
 * Progress Tracker: Calculates overall progress based on task statuses.
 * @param {Array} tasks - List of tasks with statuses (e.g., [{ status: 'completed' }, ...]).
 * @returns {Object} - Progress summary.
 */
async function trackProgress(tasks) {
  const completed = tasks.filter(task => task.status === 'completed').length;
  const inProgress = tasks.filter(task => task.status === 'in-progress').length;
  const total = tasks.length;

  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return {
    totalTasks: total,
    completedTasks: completed,
    inProgressTasks: inProgress,
    progressPercentage,
  };
}

/**
 * Génère une analyse IA pour une évaluation
 * @param {Object} params - Paramètres pour l'analyse
 * @param {Object} params.project - Objet projet
 * @param {number} params.score - Score d'évaluation
 * @param {Array} params.criteria - Critères d'évaluation
 * @returns {string} - Analyse générée par l'IA
 */
async function generateAIAnalysis({ project, score, criteria }) {
  try {
    const prompt = `
      Analysez cette évaluation de projet :
      Projet : ${project.titre}
      Description : ${project.description}
      Compétences : ${project.skills.join(', ')}
      Score : ${score}/20
      Critères : ${JSON.stringify(criteria)}
      
      Fournissez :
      1. Analyse de performance
      2. Points d'amélioration
      3. Recommandations d'apprentissage
      4. Suggestions de développement des compétences
    `;

    const response = await client.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: CONFIG.MAX_TOKENS
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'analyse IA:', error);
    return 'Impossible de générer l\'analyse IA pour le moment.';
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
      messages: [{ role: 'user', content: prompt }],
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
 * @param {Object} project - Objet projet
 * @param {Array} evaluations - Évaluations du projet
 * @returns {Object} - Recommandations d'apprentissage
 */
async function generateLearningRecommendations(project, evaluations) {
  try {
    const prompt = `
      Basé sur ce projet et ses évaluations :
      Projet : ${project.titre}
      Compétences : ${project.skills.join(', ')}
      Évaluations : ${JSON.stringify(evaluations)}
      
      Fournissez :
      1. Ressources d'apprentissage recommandées
      2. Parcours de développement des compétences
      3. Exercices pratiques
      4. Prochaines étapes pour l'amélioration
    `;

    const response = await client.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: CONFIG.MAX_TOKENS
    });

    return {
      recommendations: response.choices[0].message.content,
      priorite: calculatePriority(project, evaluations)
    };
  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error);
    return {
      recommendations: 'Impossible de générer les recommandations pour le moment.',
      priorite: 'MOYENNE'
    };
  }
}

/**
 * Calcule le niveau de priorité pour les recommandations
 * @param {Object} project - Objet projet
 * @param {Array} evaluations - Évaluations du projet
 * @returns {string} - Niveau de priorité
 */
function calculatePriority(project, evaluations) {
  const averageScore = evaluations.reduce((sum, eval) => sum + eval.score, 0) / evaluations.length;
  if (averageScore < 10) return 'HAUTE';
  if (averageScore < 15) return 'MOYENNE';
  return 'BASSE';
}

/**
 * Scheduler IA: Generates an optimized schedule based on tasks and priorities.
 * @param {Array} tasks - List of tasks with priorities and durations (e.g., [{ name, priority, duration }]).
 * @returns {Array} - Optimized task schedule.
 */
async function scheduleTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    throw new Error('❌ Task list is empty. Cannot generate schedule.');
  }

  return tasks
      .sort((a, b) => b.priority - a.priority)
      .map((task, index, array) => {
        const startTime = index === 0 ? 0 : array[index - 1].endTime;
        const endTime = startTime + task.duration;
        return { ...task, startTime, endTime };
      });
}

/**
 * Team Builder IA: Forms teams based on skills, availability, and preferences.
 * @param {Array} members - List of team members (e.g., [{ name, skills, availability, preferences }]).
 * @returns {Array} - Optimized teams.
 */
async function buildTeams(members) {
  if (!members || members.length === 0) {
    throw new Error('❌ Members list is empty. Cannot build teams.');
  }

  const prompt = `Formez des équipes optimisées en fonction des compétences, disponibilités et préférences suivantes. Retournez uniquement au format JSON : ${JSON.stringify(members)}`;
  return processAIResponse(prompt);
}

/**
 * Tutor Matcher: Matches mentors with mentees based on skills and needs.
 * @param {Array} members - List of team members (e.g., [{ name, skills, needs }]).
 * @returns {Array} - Mentor-mentee pairs.
 */
async function matchTutors(members) {
  if (!members || members.length === 0) {
    throw new Error('❌ Members list is empty. Cannot match tutors.');
  }

  const prompt = `Associez les mentors et tutorés selon leurs compétences et besoins. Retournez uniquement au format JSON : ${JSON.stringify(members)}`;
  return processAIResponse(prompt);
}

/**
 * Learning Recommender: Recommends learning resources based on skills to develop.
 * @param {Array} skills - List of skills or topics to improve (e.g., ['JavaScript', 'Team Management']).
 * @returns {Array} - Recommended learning resources.
 */
async function recommendLearning(skills) {
  if (!skills || skills.length === 0) {
    throw new Error('❌ Skills list is empty. Cannot recommend learning resources.');
  }

  const prompt = `Recommandez des ressources d'apprentissage pour les compétences suivantes. Retournez uniquement au format JSON : ${skills.join(', ')}`;
  return processAIResponse(prompt);
}

module.exports = {
  generateText,
  trackProgress,
  predictPerformance,
  scheduleTasks,
  buildTeams,
  matchTutors,
  recommendLearning,
  generateAIAnalysis,
  generateLearningRecommendations
};