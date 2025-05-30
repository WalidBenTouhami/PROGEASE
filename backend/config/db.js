const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

const connecterBD = async (uri) => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info('Connexion à MongoDB établie avec succès');
    } catch (error) {
        logger.error('Erreur de connexion à MongoDB:', error.message);
        throw error;
    }
};

module.exports = connecterBD;