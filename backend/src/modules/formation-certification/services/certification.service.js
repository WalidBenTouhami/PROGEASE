// src/modules/formation-certification/services/certification.service.js

import { Certificat } from 'backend/src/modules/formation-certification/models/certification.model.js';
import { Formation } from 'backend/src/modules/formation-certification/models/formation.model.js';

export class CertificationService {
    static async issueCertificate(userId, formationId) {
        const formation = await Formation.findById(formationId)
            .populate('quizzes');

        const passedQuizzes = formation.quizzes.every(quiz =>
            quiz.scores.some(score =>
                score.user.equals(userId) && score.value >= 80
            )
        );

        if (!passedQuizzes) {
            throw new Error('Conditions de certification non remplies');
        }

        return Certificat.create({
            userId,
            formationId,
            expirationDate: new Date().setFullYear(new Date().getFullYear() + 1)
        });
    }
}