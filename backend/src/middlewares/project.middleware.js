// src/middlewares/project.middleware.js

const { projectSchema } = require('../validations/project.validation');

const validateProject = async (req, res, next) => {
    try {
        await projectSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        res.status(400).json({
            errors: error.inner.map(err => ({
                path: err.path,
                message: err.message,
            })),
        });
    }
};

module.exports = { validateProject };