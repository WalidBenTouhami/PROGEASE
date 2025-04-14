// src/modules/formation-certification/services/formation.service.js

import Formation from '../models/formation.model.js';

export class FormationService {
    static async createFormation(formationData) {
        return Formation.create(formationData);
    }

    static async getFormationsWithProgress(userId) {
        return Formation.aggregate([
            {
                $lookup: {
                    from: 'progresses',
                    let: { formationId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$formation', '$$formationId'] },
                                        { $eq: ['$user', userId] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'userProgress'
                }
            },
            {
                $addFields: {
                    progress: {
                        $ifNull: [{ $arrayElemAt: ['$userProgress.percentage', 0] }, 0]
                    }
                }
            }
        ]);
    }

    static async searchFormations(query) {
        return Formation.find({
            $text: { $search: query }
        }).sort({ score: { $meta: 'textScore' } });
    }
}