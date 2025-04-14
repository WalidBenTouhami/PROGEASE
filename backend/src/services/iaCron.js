// 📁 src/services/iaCron.js

import { schedule } from 'node-cron';
import { logger } from '../utils/logger.js';
import * as IaService from './ia.service.js';
import { QueueService } from '../utils/queue.js';
import Project from '../models/Project.js'; // Importation manquante ajoutée

const CRON_CONFIG = {
  performancePrediction: '0 3 * * *', // 3h du matin
  progressTracking: '*/30 * * * *', // Toutes les 30 minutes
  cleanup: '0 0 * * 0' // Chaque dimanche à minuit
};

export class Scheduler {
  constructor() {
    this.jobs = new Map();
    this.queueService = new QueueService();
  }

  init() {
    this.jobs.set('performance', schedule(
      CRON_CONFIG.performancePrediction,
      this.runPerformancePredictions.bind(this)
    ));

    this.jobs.set('progress', schedule(
      CRON_CONFIG.progressTracking,
      this.trackAllProjectsProgress.bind(this)
    ));

    this.jobs.set('cleanup', schedule(
      CRON_CONFIG.cleanup,
      this.cleanupOldData.bind(this)
    ));
  }

  async runPerformancePredictions() {
    try {
      const projects = await Project.find().lean();
      await this.queueService.addBulk(
        'performance-prediction',
        projects.map(p => ({ id: p._id }))
      );
      logger.info(`Scheduled ${projects.length} predictions`);
    } catch (error) {
      logger.error(`Prediction scheduling failed: ${error.message}`);
    }
  }

  async trackAllProjectsProgress() {
    const cursor = Project.find().cursor({ batchSize: 100 });

    cursor.on('data', async (project) => {
      try {
        await IaService.trackProgress(project._id);
      } catch (error) {
        logger.error(`Error tracking progress for project ${project._id}: ${error.message}`);
      }
    });

    cursor.on('error', (error) => {
      logger.error(`Progress tracking error: ${error.message}`);
    });
  }

  async cleanupOldData() {
    try {
      // Suppression des données de plus de 6 mois
      const result = await Project.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 15552000000) }
      });
      logger.info(`Cleanup completed: ${result.deletedCount} old records removed.`);
    } catch (error) {
      logger.error(`Cleanup failed: ${error.message}`);
    }
  }
}