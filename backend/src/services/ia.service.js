// src/services/ia.service.js

export const matchTutor = async (projectId) => {
    const project = await Project.findById(projectId)
        .select('skills')
        .lean();

    return User.aggregate([
        {
            $match: {
                role: 'tuteur',
                availability: true,
                skills: { $in: project.skills }
            }
        },
        {
            $addFields: {
                skillMatchCount: {
                    $size: { $setIntersection: [project.skills, '$skills'] }
                },
                experienceWeight: { $multiply: ['$experience', 0.1] }
            }
        },
        {
            $sort: {
                skillMatchCount: -1,
                experienceWeight: -1
            }
        },
        { $limit: 3 }
    ]);
};