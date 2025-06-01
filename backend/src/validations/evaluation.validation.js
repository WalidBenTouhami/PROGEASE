const yup = require('yup');

const evaluationSchema = yup.object().shape({
    score: yup.number()
        .min(0, 'Score must be between 0 and 20')
        .max(20, 'Score must be between 0 and 20')
        .required('Score is required'),
    comments: yup.string()
        .min(3, 'Comments must be at least 3 characters')
        .max(1000, 'Comments must not exceed 1000 characters'),
    criteria: yup.array().of(
        yup.object().shape({
            name: yup.string().required('Criterion name is required'),
            score: yup.number()
                .min(0, 'Criterion score must be between 0 and 20')
                .max(20, 'Criterion score must be between 0 and 20')
                .required('Criterion score is required'),
            weight: yup.number()
                .min(0, 'Weight must be between 0 and 1')
                .max(1, 'Weight must be between 0 and 1')
                .required('Weight is required'),
            comments: yup.string()
                .max(500, 'Criterion comments must not exceed 500 characters')
        })
    ),
    projetId: yup.string()
        .required('Projet ID is required'),
    evaluatorId: yup.string()
        .required('Evaluator ID is required')
});

module.exports = {
    evaluationSchema
}; 