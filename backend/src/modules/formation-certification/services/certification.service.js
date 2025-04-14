// src/modules/formation-certification/services/certification.service.js

import { Certificat } from '../models/Certification.js';
import { Formation } from '../models/Formation.js';

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