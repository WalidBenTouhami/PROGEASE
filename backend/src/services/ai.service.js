const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config(({ path: 'D:\\ESPRIT2\\9. Projet intégré\\PROGEASE\\backend\\.env' }));

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateText(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erreur lors de la génération de texte :', error);
    throw error;
  }
}

module.exports = { generateText };