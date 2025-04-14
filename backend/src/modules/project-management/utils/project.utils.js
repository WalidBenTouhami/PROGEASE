// src/modules/project-management/utils/project.utils.js

export const ProjectUtils = {
    generateProjectCode: (teamSize) => {
        const prefix = new Date().getFullYear().toString().slice(-2);
        const randomHex = Math.floor(Math.random() * 16777215).toString(16);
        return `${prefix}-${teamSize}-${randomHex}`.toUpperCase();
    },

    calculateRiskScore: (project) => {
        const durationRisk = (project.durationDays > 90) ? 0.3 : 0.1;
        const teamRisk = (project.team.length < 3) ? 0.4 : 0.1;
        return Math.min(durationRisk + teamRisk, 1);
    }
};