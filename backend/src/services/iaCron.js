// services/iaCron.js

const { scheduleJob } = require('node-schedule');
const Project = require('../modules/project-management/models/project.model');
const IaService = require('./ia.service');
const logger = require('../utils/logger');

exports.initScheduledJobs = () => {
    // 🔁 Tâche de progression
    scheduleJob('0 0 * * *', async () => {
        try {
            const projects = await Project.find().lean();
            await Promise.allSettled(
                projects.map(p => IaService.trackProgress(p._id))
            );
        } catch (error) {
            logger.error(`[CRON:Progression] ${error.message}`);
        }
    });

    // ... autres jobs
};