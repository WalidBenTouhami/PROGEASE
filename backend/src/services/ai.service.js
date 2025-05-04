const deepseek = require('deepseek'); // Import the library
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: 'D:\\ESPRIT2\\9. Projet intégré\\PROGEASE\\backend\\.env' });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  throw new Error('❌ DEEPSEEK_API_KEY is missing. Please check your .env file.');
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
 * Performance Predictor: Predicts performance based on historical data.
 * @param {Array} history - Array of past task durations (e.g., [2, 3, 1.5]).
 * @returns {Object} - Predicted performance metrics.
 */
async function predictPerformance(history) {
  if (!history || history.length === 0) {
    throw new Error('❌ Historical data is required for performance prediction.');
  }

  const averageTime = history.reduce((sum, time) => sum + time, 0) / history.length;
  return {
    averageCompletionTime: averageTime.toFixed(2),
    predictedCompletion: `Estimated completion time for the next task: ${averageTime.toFixed(2)} hours.`,
  };
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
};