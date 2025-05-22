// testGithubService.js
const { verifierDepotGithubExiste } = require('./src/services/github.service');

(async () => {
  try {
    // URL valide
    const urlValid = 'https://github.com/WalidBenTouhami/PROGEASE';
    const existsValid = await verifierDepotGithubExiste(urlValid);
    console.log(`Le dépôt "${urlValid}" existe ?`, existsValid);

    // URL invalide
    const urlInvalid = 'https://github.com/WalidBenTouhami/NonExistentRepo';
    const existsInvalid = await verifierDepotGithubExiste(urlInvalid);
    console.log(`Le dépôt "${urlInvalid}" existe ?`, existsInvalid);

    // URL mal formatée
    const urlMalformed = 'https://github.com/Invalid/URL/';
    const existsMalformed = await verifierDepotGithubExiste(urlMalformed);
    console.log(`Le dépôt "${urlMalformed}" existe ?`, existsMalformed);
  } catch (error) {
    console.error('Une erreur est survenue :', error.message);
  }
})();