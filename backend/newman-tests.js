const newman = require('newman');
  const path = require('path');

  // Collection et environnement Postman - chemins corrigés
  const collection = path.join(__dirname, 'tests/PROGEASE.postman_collection.json');
  const environment = path.join(__dirname, 'tests/PROGEASE.postman_environment.json');

  newman.run({
    collection: collection,
    environment: environment,
    reporters: ['cli', 'htmlextra'],
    reporter: {
      htmlextra: {
        export: './reports/newman/',
        browserTitle: "Rapport de Tests API Progease",
        title: "Rapport de Tests d'Intégration",
        logs: true
      }
    }
  }, function (err) {
    if (err) { throw err; }
    console.log('Tests Newman terminés avec succès');
  });