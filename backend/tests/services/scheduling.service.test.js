// tests/services/scheduling.service.test.js
const schedulingService = require('../../src/services/scheduling.service');

jest.setTimeout(10000);

describe('SchedulingService', () => {
    describe('genererRappels', () => {
        it('devrait générer des rappels pour un projet avec échéances proches', async () => {
            const maintenant = new Date();
            const dans5Jours = new Date(maintenant.getTime() + 5 * 24 * 60 * 60 * 1000);
            const dans2Jours = new Date(maintenant.getTime() + 2 * 24 * 60 * 60 * 1000);

            const projet = {
                _id: '507f1f77bcf86cd799439011',
                titre: 'Projet Test',
                dateFin: dans5Jours,
                equipe: ['user1', 'user2'],
                livrables: [
                    {
                        _id: 'livrable1',
                        intitule: 'Livrable Test',
                        dateLimite: dans2Jours,
                        statut: 'EN_COURS',
                    },
                ],
                taches: [
                    {
                        _id: 'tache1',
                        titre: 'Tâche Test',
                        dateFin: dans2Jours,
                        statut: 'EN_COURS',
                        assigneA: 'user1',
                    },
                ],
            };

            const rappels = await schedulingService.genererRappels(projet);

            expect(rappels).toBeDefined();
            expect(Array.isArray(rappels)).toBe(true);
            expect(rappels.length).toBeGreaterThan(0);

            // Vérifier qu'il y a un rappel pour le projet
            const rappelProjet = rappels.find(r => r.type === 'DEADLINE_PROJET');
            expect(rappelProjet).toBeDefined();
            expect(rappelProjet.titre).toContain('Projet Test');

            // Vérifier qu'il y a un rappel pour le livrable
            const rappelLivrable = rappels.find(r => r.type === 'DEADLINE_LIVRABLE');
            expect(rappelLivrable).toBeDefined();
            expect(rappelLivrable.priorite).toBe('URGENTE');

            // Vérifier qu'il y a un rappel pour la tâche
            const rappelTache = rappels.find(r => r.type === 'DEADLINE_TACHE');
            expect(rappelTache).toBeDefined();
        });

        it('ne devrait pas générer de rappels pour un projet sans échéances proches', async () => {
            const maintenant = new Date();
            const dans30Jours = new Date(maintenant.getTime() + 30 * 24 * 60 * 60 * 1000);

            const projet = {
                _id: '507f1f77bcf86cd799439011',
                titre: 'Projet Test',
                dateFin: dans30Jours,
                equipe: ['user1', 'user2'],
                livrables: [],
                taches: [],
            };

            const rappels = await schedulingService.genererRappels(projet);

            expect(rappels).toBeDefined();
            expect(Array.isArray(rappels)).toBe(true);
            expect(rappels.length).toBe(0);
        });

        it('devrait rejeter si le projet est null', async () => {
            await expect(schedulingService.genererRappels(null)).rejects.toThrow(
                'Le projet est requis pour générer des rappels'
            );
        });
    });

    describe('planifierEvenements', () => {
        it('devrait planifier des événements hebdomadaires', async () => {
            const dateDebut = new Date('2024-01-01');
            const dateFin = new Date('2024-03-01');

            const projet = {
                _id: '507f1f77bcf86cd799439011',
                titre: 'Projet Test',
                dateDebut: dateDebut,
                dateFin: dateFin,
                equipe: ['user1', 'user2'],
                tuteur: 'tuteur1',
            };

            const planning = await schedulingService.planifierEvenements({
                projet,
                type: 'REUNION',
                frequence: 'HEBDOMADAIRE',
            });

            expect(planning).toBeDefined();
            expect(planning.evenements).toBeDefined();
            expect(Array.isArray(planning.evenements)).toBe(true);
            expect(planning.evenements.length).toBeGreaterThan(0);

            // Vérifier les statistiques
            expect(planning.statistiques).toBeDefined();
            expect(planning.statistiques.total).toBe(planning.evenements.length);
            expect(planning.statistiques.reunions).toBeGreaterThan(0);

            // Vérifier qu'il y a une soutenance finale
            const soutenance = planning.evenements.find(e => e.type === 'SOUTENANCE');
            expect(soutenance).toBeDefined();
            expect(soutenance.importance).toBe('CRITIQUE');
        });

        it('devrait planifier une revue de mi-parcours pour un projet long', async () => {
            const dateDebut = new Date('2024-01-01');
            const dateFin = new Date('2024-04-01'); // 3 mois

            const projet = {
                _id: '507f1f77bcf86cd799439011',
                titre: 'Projet Test',
                dateDebut: dateDebut,
                dateFin: dateFin,
                equipe: ['user1', 'user2'],
                tuteur: 'tuteur1',
            };

            const planning = await schedulingService.planifierEvenements({
                projet,
                frequence: 'HEBDOMADAIRE',
            });

            const revue = planning.evenements.find(e => e.type === 'REVUE');
            expect(revue).toBeDefined();
            expect(revue.titre).toContain('mi-parcours');
        });

        it('devrait rejeter si les dates du projet sont manquantes', async () => {
            const projet = {
                _id: '507f1f77bcf86cd799439011',
                titre: 'Projet Test',
                equipe: ['user1', 'user2'],
            };

            await expect(schedulingService.planifierEvenements({ projet })).rejects.toThrow(
                'Les dates du projet sont requises'
            );
        });
    });

    describe('envoyerNotifications', () => {
        it('devrait envoyer des notifications pour les rappels', async () => {
            const maintenant = new Date();
            const rappels = [
                {
                    id: 'rappel1',
                    type: 'DEADLINE_PROJET',
                    titre: 'Test Rappel',
                    dateRappel: maintenant,
                    destinataires: ['user1', 'user2'],
                },
            ];

            const resultat = await schedulingService.envoyerNotifications(rappels);

            expect(resultat).toBeDefined();
            expect(resultat.success).toBe(true);
            expect(resultat.envoyes).toBe(1);
            expect(resultat.notifications).toBeDefined();
            expect(resultat.notifications.length).toBe(1);
        });

        it('ne devrait pas envoyer de notifications si la liste est vide', async () => {
            const resultat = await schedulingService.envoyerNotifications([]);

            expect(resultat).toBeDefined();
            expect(resultat.success).toBe(true);
            expect(resultat.envoyes).toBe(0);
        });

        it("ne devrait pas envoyer de notifications dont la date n'est pas encore atteinte", async () => {
            const demain = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const rappels = [
                {
                    id: 'rappel1',
                    type: 'DEADLINE_PROJET',
                    titre: 'Test Rappel',
                    dateRappel: demain,
                    destinataires: ['user1'],
                },
            ];

            const resultat = await schedulingService.envoyerNotifications(rappels);

            expect(resultat).toBeDefined();
            expect(resultat.envoyes).toBe(0);
        });
    });

    describe('detecterConflits', () => {
        it('devrait détecter des conflits de chevauchement', () => {
            const date1 = new Date('2024-01-01T10:00:00');
            const date2 = new Date('2024-01-01T10:30:00');

            const evenements = [
                {
                    titre: 'Réunion 1',
                    date: date1,
                    duree: 60, // 1 heure
                    participants: ['user1', 'user2'],
                },
                {
                    titre: 'Réunion 2',
                    date: date2,
                    duree: 60,
                    participants: ['user1', 'user3'],
                },
            ];

            const conflits = schedulingService.detecterConflits(evenements);

            expect(conflits).toBeDefined();
            expect(Array.isArray(conflits)).toBe(true);
            expect(conflits.length).toBe(1);
            expect(conflits[0].type).toBe('CHEVAUCHEMENT');
            expect(conflits[0].participantsCommuns).toContain('user1');
        });

        it('ne devrait pas détecter de conflits si les événements ne se chevauchent pas', () => {
            const date1 = new Date('2024-01-01T10:00:00');
            const date2 = new Date('2024-01-01T12:00:00');

            const evenements = [
                {
                    titre: 'Réunion 1',
                    date: date1,
                    duree: 60,
                    participants: ['user1', 'user2'],
                },
                {
                    titre: 'Réunion 2',
                    date: date2,
                    duree: 60,
                    participants: ['user1', 'user3'],
                },
            ];

            const conflits = schedulingService.detecterConflits(evenements);

            expect(conflits).toBeDefined();
            expect(conflits.length).toBe(0);
        });

        it('devrait retourner un tableau vide si moins de 2 événements', () => {
            const evenements = [
                {
                    titre: 'Réunion 1',
                    date: new Date(),
                    duree: 60,
                    participants: ['user1'],
                },
            ];

            const conflits = schedulingService.detecterConflits(evenements);

            expect(conflits).toBeDefined();
            expect(conflits.length).toBe(0);
        });
    });
});
