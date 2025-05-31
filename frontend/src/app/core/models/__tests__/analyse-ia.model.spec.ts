import { 
  AnalyseIA, 
  PhaseProjet, 
  JalonProjet, 
  ComplexiteProjet,
  RecommandationApprentissage 
} from '../analyse-ia.model';

describe('AnalyseIA Model', () => {
  let analyseIA: AnalyseIA;
  let recommandation: RecommandationApprentissage;

  beforeEach(() => {
    analyseIA = {
      analyse: {
        complexite: ComplexiteProjet.MOYENNE,
        dureeEstimee: '3 mois',
        risques: ['Délais serrés', 'Dépendances techniques'],
        points_forts: ['Équipe expérimentée', 'Technologies modernes'],
        recommandations: ['Tests automatisés', 'Documentation']
      },
      competences: {
        requises: ['Angular', 'Node.js'],
        recommandees: ['TypeScript', 'MongoDB'],
        niveau: 'INTERMEDIAIRE'
      },
      planning: {
        phases: [
          {
            nom: 'Conception',
            duree: '2 semaines',
            livrables: ['Documentation technique']
          }
        ],
        jalons: [
          {
            nom: 'Validation conception',
            date: '2024-06-15'
          }
        ]
      }
    };

    recommandation = {
      competence: 'Angular',
      ressources: {
        cours: {
          titre: 'Angular Fundamentals',
          lien: 'https://example.com/course'
        },
        livre: {
          titre: 'Angular in Action',
          auteur: 'John Doe'
        },
        projet: {
          titre: 'Todo App',
          description: 'Application de gestion de tâches'
        },
        communaute: {
          nom: 'Angular Community',
          lien: 'https://example.com/community'
        }
      }
    };
  });

  describe('AnalyseIA', () => {
    it('should create a valid analysis', () => {
      expect(analyseIA).toBeTruthy();
      expect(analyseIA.analyse.complexite).toBe(ComplexiteProjet.MOYENNE);
      expect(analyseIA.competences.requises.length).toBeGreaterThan(0);
      expect(analyseIA.planning.phases.length).toBeGreaterThan(0);
    });

    it('should have valid complexity values', () => {
      expect(Object.values(ComplexiteProjet)).toContain(ComplexiteProjet.SIMPLE);
      expect(Object.values(ComplexiteProjet)).toContain(ComplexiteProjet.MOYENNE);
      expect(Object.values(ComplexiteProjet)).toContain(ComplexiteProjet.COMPLEXE);
      expect(Object.values(ComplexiteProjet)).toContain(ComplexiteProjet.TRES_COMPLEXE);
    });

    it('should validate phases structure', () => {
      const phase = analyseIA.planning.phases[0];
      expect(phase.nom).toBeTruthy();
      expect(phase.duree).toBeTruthy();
      expect(Array.isArray(phase.livrables)).toBeTruthy();
    });

    it('should validate milestones structure', () => {
      const jalon = analyseIA.planning.jalons[0];
      expect(jalon.nom).toBeTruthy();
      expect(jalon.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('RecommandationApprentissage', () => {
    it('should create a valid learning recommendation', () => {
      expect(recommandation).toBeTruthy();
      expect(recommandation.competence).toBe('Angular');
    });

    it('should have all required resource types', () => {
      expect(recommandation.ressources.cours).toBeTruthy();
      expect(recommandation.ressources.livre).toBeTruthy();
      expect(recommandation.ressources.projet).toBeTruthy();
      expect(recommandation.ressources.communaute).toBeTruthy();
    });

    it('should validate resource links', () => {
      expect(recommandation.ressources.cours.lien).toMatch(/^https?:\/\//);
      expect(recommandation.ressources.communaute.lien).toMatch(/^https?:\/\//);
    });
  });
}); 