const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Créer les répertoires nécessaires
const dbPath = path.join(__dirname, '..', 'data', 'db');
const logPath = path.join(__dirname, '..', 'data', 'log');

if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
}

if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath, { recursive: true });
}

// Démarrer MongoDB
const mongod = spawn('mongod', [
    '--dbpath', dbPath,
    '--logpath', path.join(logPath, 'mongod.log')
], {
    // Sous Windows, on ne peut pas utiliser --fork
    windowsHide: true
});

mongod.stdout.on('data', (data) => {
    console.log(`MongoDB stdout: ${data}`);
});

mongod.stderr.on('data', (data) => {
    console.error(`MongoDB stderr: ${data}`);
});

mongod.on('close', (code) => {
    console.log(`MongoDB process exited with code ${code}`);
});

// Gérer la fermeture propre
process.on('SIGINT', () => {
    console.log('Arrêt de MongoDB...');
    mongod.kill('SIGINT');
    process.exit();
}); 