// Configuration des variables d'environnement pour les tests
process.env.DEEPSEEK_API_KEY = 'test-api-key';
process.env.AI_MODEL = 'test-model';
process.env.AI_MAX_TOKENS = '1000';
process.env.AI_TEMPERATURE = '0.7';
process.env.AI_RETRY_LIMIT = '3';
process.env.AI_RETRY_DELAY = '1000';

// Mock axios
jest.mock('axios', () => {
    const mockPost = jest.fn();
    return {
        create: () => ({
            post: mockPost,
        }),
    };
});

const {
    analyserProjet,
    suiviProgression,
    creerEquipes,
    associerTuteurs,
    recommanderApprentissage,
} = require('../../src/services/ai.service');
const axios = require('axios');

jest.setTimeout(60000); // Augmenter le délai global pour tous les tests

describe('AIService', () => {
    let mockAxiosPost;

    beforeEach(() => {
        // Reset tous les mocks avant chaque test
        jest.clearAllMocks();

        // Récupérer la référence au mock
        mockAxiosPost = axios.create().post;

        // Configuration par défaut du mock axios
        mockAxiosPost.mockResolvedValue({
            data: {
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                status: 'success',
                                analyse: 'Analyse du projet : Risques identifiés...',
                                timestamp: new Date().toISOString(),
                            }),
                        },
                    },
                ],
            },
        });
    });

    describe('analyserProjet', () => {
        it('devrait analyser un projet avec des données valides', async () => {
            const projetData = {
                titre: 'Test Projet',
                description: 'Description du projet de test',
                dateDebut: new Date(),
                dateFin: new Date(Date.now() + 86400000),
                statut: 'En cours',
                priorite: 'Haute',
                equipe: ['membre1', 'membre2'],
            };

            const analyse = await analyserProjet(projetData);
            expect(analyse).toBeDefined();
            expect(analyse.status).toBe('success');
            expect(analyse.analyse).toBeDefined();
            expect(analyse.timestamp).toBeDefined();
            expect(mockAxiosPost).toHaveBeenCalled();
        }, 30000);

        it('devrait rejeter une analyse avec des données invalides', async () => {
            // Configurer le mock pour rejeter les données invalides
            mockAxiosPost.mockRejectedValue(new Error('Données invalides'));

            // Tester avec des données invalides
            await expect(analyserProjet(null)).rejects.toThrow("echec de l'analyse du projet");
            await expect(analyserProjet(undefined)).rejects.toThrow("echec de l'analyse du projet");
            await expect(analyserProjet({})).rejects.toThrow("echec de l'analyse du projet");
        }, 30000);
    });

    describe('suiviProgression', () => {
        it('devrait calculer la progression des tâches', async () => {
            const taches = [{ statut: 'Termine' }, { statut: 'En cours' }, { statut: 'À faire' }];

            const progression = await suiviProgression(taches);
            expect(progression).toBeDefined();
            expect(progression.totalTaches).toBe(3);
            expect(progression.tachesTerminees).toBe(1);
            expect(progression.tachesEnCours).toBe(1);
            expect(progression.pourcentageProgression).toBe(33);
        }, 30000);

        it('devrait gérer une liste de tâches vide', async () => {
            const progression = await suiviProgression([]);
            expect(progression).toBeDefined();
            expect(progression.totalTaches).toBe(0);
            expect(progression.pourcentageProgression).toBe(0);
        }, 30000);
    });

    describe('creerEquipes', () => {
        beforeEach(() => {
            mockAxiosPost.mockResolvedValue({
                data: {
                    choices: [
                        {
                            message: {
                                content: JSON.stringify({
                                    equipes: [
                                        {
                                            id: 'equipe1',
                                            membres: ['user1', 'user2'],
                                            competencesPrincipales: ['JavaScript', 'React'],
                                            forceEstimee: 8.5,
                                        },
                                    ],
                                }),
                            },
                        },
                    ],
                },
            });
        });

        it("devrait former des équipes à partir d'une liste de membres", async () => {
            const membres = [
                { id: 'user1', nom: 'Alice', competences: ['JavaScript', 'React'] },
                { id: 'user2', nom: 'Bob', competences: ['Python', 'Django'] },
                { id: 'user3', nom: 'Charlie', competences: ['JavaScript', 'Node.js'] },
            ];

            const result = await creerEquipes(membres);
            expect(result).toBeDefined();
            expect(result.equipes).toBeDefined();
            expect(Array.isArray(result.equipes)).toBe(true);
            expect(mockAxiosPost).toHaveBeenCalled();
        }, 30000);

        it('devrait rejeter si la liste de membres est vide', async () => {
            await expect(creerEquipes([])).rejects.toThrow('Liste de membres vide');
        }, 30000);

        it("devrait rejeter si le paramètre n'est pas un tableau", async () => {
            await expect(creerEquipes(null)).rejects.toThrow('Liste de membres vide');
            await expect(creerEquipes('invalid')).rejects.toThrow('Liste de membres vide');
        }, 30000);
    });

    describe('associerTuteurs', () => {
        beforeEach(() => {
            mockAxiosPost.mockResolvedValue({
                data: {
                    choices: [
                        {
                            message: {
                                content: JSON.stringify({
                                    associations: [
                                        {
                                            equipe: 'equipe1',
                                            tuteur: 'tuteur1',
                                            raisonAssociation: 'Expertise en développement web',
                                            scoreCompatibilite: 0.85,
                                        },
                                    ],
                                }),
                            },
                        },
                    ],
                },
            });
        });

        it('devrait associer des tuteurs aux équipes', async () => {
            const membres = [
                { id: 'tuteur1', role: 'TUTEUR', competences: ['JavaScript', 'React'] },
                { id: 'equipe1', role: 'EQUIPE', competences: ['JavaScript'] },
            ];

            const result = await associerTuteurs(membres);
            expect(result).toBeDefined();
            expect(result.associations).toBeDefined();
            expect(Array.isArray(result.associations)).toBe(true);
            expect(mockAxiosPost).toHaveBeenCalled();
        }, 30000);

        it('devrait rejeter si la liste est vide', async () => {
            await expect(associerTuteurs([])).rejects.toThrow('Liste de membres vide');
        }, 30000);
    });

    describe('recommanderApprentissage', () => {
        beforeEach(() => {
            mockAxiosPost.mockResolvedValue({
                data: {
                    choices: [
                        {
                            message: {
                                content: JSON.stringify({
                                    recommandations: [
                                        {
                                            competence: 'JavaScript',
                                            ressources: {
                                                cours: {
                                                    titre: 'JavaScript Avancé',
                                                    lien: 'https://example.com',
                                                },
                                                livre: {
                                                    titre: "You Don't Know JS",
                                                    auteur: 'Kyle Simpson',
                                                },
                                                projet: {
                                                    titre: 'Todo App',
                                                    description: 'Application de gestion de tâches',
                                                },
                                                communaute: {
                                                    nom: 'r/javascript',
                                                    lien: 'https://reddit.com/r/javascript',
                                                },
                                            },
                                        },
                                    ],
                                }),
                            },
                        },
                    ],
                },
            });
        });

        it("devrait recommander des ressources d'apprentissage", async () => {
            const competences = ['JavaScript', 'React', 'Node.js'];

            const result = await recommanderApprentissage(competences);
            expect(result).toBeDefined();
            expect(result.recommandations).toBeDefined();
            expect(Array.isArray(result.recommandations)).toBe(true);
            expect(mockAxiosPost).toHaveBeenCalled();
        }, 30000);

        it('devrait rejeter si la liste de compétences est vide', async () => {
            await expect(recommanderApprentissage([])).rejects.toThrow('Liste de competences vide');
        }, 30000);

        it("devrait rejeter si le paramètre n'est pas un tableau", async () => {
            await expect(recommanderApprentissage(null)).rejects.toThrow(
                'Liste de competences vide'
            );
        }, 30000);
    });
});
