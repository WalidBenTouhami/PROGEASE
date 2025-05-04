//src/services/ai.service.js

const deepseek = require('deepseek'); // Import the library
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: 'D:\\ESPRIT2\\9. Projet intégré\\PROGEASE\\backend\\.env' });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  throw new Error('❌ DEEPSEEK_API_KEY is missing. Please check your .env file.');
}

console.log('✅ DEEPSEEK_API_KEY loaded successfully.');

// Log the DeepSeek module for debugging
console.log('DeepSeek Module:', deepseek);
console.log('DeepSeek Keys:', Object.keys(deepseek));

// Initialize the DeepSeek client
let client;
try {
  if (deepseek && typeof deepseek.createClient === 'function') {
    client = deepseek.createClient({ apiKey: DEEPSEEK_API_KEY });
  } else {
    console.warn('⚠️ DeepSeek is empty or improperly exported. Using a mock implementation for testing.');
    client = {
      generateText: async ({ model, prompt, maxTokens }) => ({
        text: `Mocked response for prompt: ${prompt}`,
      }),
    };
  }
} catch (error) {
  console.error('❌ Error initializing DeepSeek client:', error.message);
  process.exit(1);
}

// Configuration constants
const CONFIG = {
  MODEL: 'gpt-3.5-turbo', // Model name
  MAX_TOKENS: 100, // Maximum tokens
};

/**
 * Generate text based on a given prompt using DeepSeek's API.
 * @param {string} prompt - The input prompt for text generation.
 * @returns {Promise<string>} - Generated text.
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
    if (error.response?.status === 429) {
      console.error('❌ Quota exceeded:', error.response.data.error.message);
      throw new Error('Quota exceeded. Please check your usage limits and try again later.');
    }

    console.error('❌ Error during text generation:', error);
    throw error;
  }
}

// Generate text based on a given prompt
async function generateText(prompt) {
  try {
    const response = await client.generateText({
      model: CONFIG.MODEL,
      prompt,
      maxTokens: CONFIG.MAX_TOKENS,
    });
    return response.text.trim();
  } catch (error) {
    console.error('❌ Error during text generation:', error.message);
    throw error;
  }
}

// Example: Summarize a conversation
async function summarizeNotes(notes) {
  const prompt = `Résume ces notes de réunion : ${notes}`;
  return await generateText(prompt);
}

// Example: Generate a task list from a description
async function generateTaskList(description) {
  const prompt = `Créer une liste de tâches à partir de cette description : ${description}`;
  return await generateText(prompt);
}

module.exports = { generateText, summarizeNotes, generateTaskList };