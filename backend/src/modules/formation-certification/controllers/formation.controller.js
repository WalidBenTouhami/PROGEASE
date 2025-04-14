// src/modules/formation-certification/controllers/formation.controller.js

import { FormationService } from '../services/formation.service.js';
import { HTTP_STATUS } from '../../../config/constants.js';

export class FormationController {
  static async createFormation(req, res) {
    try {
      const formation = await FormationService.createFormation(req.body);
      res.status(HTTP_STATUS.CREATED).json(formation);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        code: 'FORMATION_CREATION_FAILED',
        message: error.message
      });
    }
  }

  static async searchFormations(req, res) {
    try {
      const results = await FormationService.searchFormations(req.query.q);
      res.status(HTTP_STATUS.OK).json(results);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        code: 'SEARCH_FAILED',
        message: error.message
      });
    }
  }
}