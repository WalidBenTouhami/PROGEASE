const { checkGithubRepoExists } = require('./src/services/github.service'); // Assurez-vous que le chemin est correct

(async () => {
    try {
        // Exemple d'URL valide
        const urlValid = 'https://github.com/WalidBenTouhami/PROGEASE';
        const existsValid = await checkGithubRepoExists(urlValid);
        console.log(`Le dépôt "${urlValid}" existe ?`, existsValid);

        // Exemple d'URL invalide (dépôt inexistant)
        const urlInvalid = 'https://github.com/WalidBenTouhami/NonExistentRepo';
        const existsInvalid = await checkGithubRepoExists(urlInvalid);
        console.log(`Le dépôt "${urlInvalid}" existe ?`, existsInvalid);

        // Exemple d'URL mal formatée
        const urlMalformed = 'https://github.com/Invalid/URL/';
        const existsMalformed = await checkGithubRepoExists(urlMalformed);
        console.log(`Le dépôt "${urlMalformed}" existe ?`, existsMalformed);
    } catch (error) {
        console.error('Une erreur est survenue :', error.message);
    }
})();