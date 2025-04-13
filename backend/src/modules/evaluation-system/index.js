const evaluationRoutes = require('./routes/evaluationRoutes');
const evaluationService = require('./services/evaluationService');
const Evaluation = require('./models/Evaluation');

module.exports = {
    routes: evaluationRoutes,
    service: evaluationService,
    model: Evaluation
};
