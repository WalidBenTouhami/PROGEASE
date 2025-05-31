import { Utilisateur, RoleUtilisateur } from '../utilisateur.model';
import { Equipe, StatutEquipe } from '../equipe.model';
import { Competence, NiveauCompetence, CategorieCompetence } from '../competence.model';
import { 
  AnalyseIA, 
  PhaseProjet, 
  JalonProjet, 
  ComplexiteProjet,
  RecommandationApprentissage 
} from '../analyse-ia.model';

describe('Models Integration', () => {
  let utilisateur: Utilisateur;
  let equipe: Equipe;
  let competence: Competence;
  let analyseIA: AnalyseIA;

  beforeEach(() => {
    // Création d'une compétence
    competence = {
      nom: 'Angular',
      description: 'Framework JavaScript pour le développement web',
      niveau: NiveauCompetence.INTERMEDIAIRE,
      categorie: CategorieCompetence.TECHNIQUE
    };

    // Création d'un utilisateur avec cette compétence
    utilisateur = {
      nom: 'John Doe',
      email: 'john.doe@example.com',
      role: RoleUtilisateur.ETUDIANT,
      competences: [competence.nom]
    };

    // Création d'une équipe avec cet utilisateur
    equipe = {
      nom: 'Team Angular',
      membres: [utilisateur._id || 'user1'],
      competencesPrincipales: [competence.nom],
      forceEstimee: 8.5
    };

    // Création d'une analyse IA pour l'équipe
    analyseIA = {
      analyse: {
        complexite: ComplexiteProjet.MOYENNE,
        dureeEstimee: '3 mois',
        risques: ['Manque d\'expérience'],
        points_forts: ['Motivation élevée'],
        recommandations: ['Formation continue']
      },
      competences: {
        requises: [competence.nom],
        recommandees: ['TypeScript'],
        niveau: competence.niveau
      },
      planning: {
        phases: [{
          nom: 'Formation Angular',
          duree: '2 semaines',
          livrables: ['Certification Angular']
        }],
        jalons: [{
          nom: 'Validation des compétences',
          date: '2024-06-15'
        }]
      }
    };
  });

  describe('User-Team-Skill Integration', () => {
    it('should link user skills with team requirements', () => {
      expect(equipe.competencesPrincipales).toContain(competence.nom);
      expect(utilisateur.competences).toContain(competence.nom);
    });

    it('should validate team member references', () => {
      expect(equipe.membres).toContain(utilisateur._id || 'user1');
    });
  });

  describe('AI Analysis Integration', () => {
    it('should reference valid competences', () => {
      expect(analyseIA.competences.requises).toContain(competence.nom);
      expect(analyseIA.competences.niveau).toBe(competence.niveau);
    });

    it('should provide relevant recommendations', () => {
      const recommendation: RecommandationApprentissage = {
        competence: competence.nom,
        ressources: {
          cours: {
            titre: 'Angular Mastery',
            lien: 'https://example.com/angular'
          },
          livre: {
            titre: 'Angular in Depth',
            auteur: 'Expert Author'
          },
          projet: {
            titre: 'Portfolio Angular',
            description: 'Création d\'un portfolio avec Angular'
          },
          communaute: {
            nom: 'Angular France',
            lien: 'https://example.com/angular-fr'
          }
        }
      };

      expect(recommendation.competence).toBe(competence.nom);
      expect(recommendation.ressources.cours.titre).toContain('Angular');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent skill references', () => {
      const skillName = competence.nom;
      expect(utilisateur.competences).toContain(skillName);
      expect(equipe.competencesPrincipales).toContain(skillName);
      expect(analyseIA.competences.requises).toContain(skillName);
    });

    it('should validate date formats', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      analyseIA.planning.jalons.forEach(jalon => {
        expect(jalon.date).toMatch(dateRegex);
      });
    });

    it('should maintain valid enums across models', () => {
      expect(Object.values(RoleUtilisateur)).toContain(utilisateur.role);
      expect(Object.values(NiveauCompetence)).toContain(competence.niveau);
      expect(Object.values(CategorieCompetence)).toContain(competence.categorie);
      expect(Object.values(ComplexiteProjet)).toContain(analyseIA.analyse.complexite);
    });
  });
}); 