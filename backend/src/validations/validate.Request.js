const validateRequest = schema => async (req, res, next) => {
    try {
        const validatedBody = await schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        // Replace request body with validated data
        req.body = validatedBody;
        next();
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: error.errors,
            });
        }
        next(error);
    }
};

module.exports = {
    validateRequest,
};
