// src/modules/project-management/utils/project.utils.test.js

        import { ProjectUtils } from './project.utils.js';

        describe('ProjectUtils', () => {
            describe('generateProjectCode', () => {
                it('should generate a unique project code', () => {
                    const teamSize = 5;
                    const code = ProjectUtils.generateProjectCode(teamSize);
                    expect(code).toMatch(/^\d{2}-\d+-[A-F0-9]+$/);
                });
            });

            describe('calculateRiskScore', () => {
                it('should calculate a low risk score for short duration and large team', () => {
                    const project = { durationDays: 30, team: [1, 2, 3, 4] };
                    const riskScore = ProjectUtils.calculateRiskScore(project);
                    expect(riskScore).toBe(0.2);
                });

                it('should calculate a high risk score for long duration and small team', () => {
                    const project = { durationDays: 120, team: [1] };
                    const riskScore = ProjectUtils.calculateRiskScore(project);
                    expect(riskScore).toBe(0.7);
                });
            });
        });