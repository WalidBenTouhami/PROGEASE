import { Competence, NiveauCompetence, CategorieCompetence } from '../competence.model';

describe('Competence Model', () => {
  let competence: Competence;

  beforeEach(() => {
    competence = {
      nom: 'Angular',
      description: 'Framework JavaScript pour le développement web',
      niveau: NiveauCompetence.INTERMEDIAIRE,
      categorie: CategorieCompetence.TECHNIQUE,
      prerequis: ['JavaScript', 'TypeScript']
    };
  });

  it('should create a valid competence', () => {
    expect(competence).toBeTruthy();
    expect(competence.nom).toBe('Angular');
    expect(competence.description).toBeTruthy();
    expect(competence.niveau).toBe(NiveauCompetence.INTERMEDIAIRE);
    expect(competence.categorie).toBe(CategorieCompetence.TECHNIQUE);
  });

  it('should handle optional fields', () => {
    const minimalCompetence: Competence = {
      nom: 'Communication',
      description: 'Capacité à communiquer efficacement',
      niveau: NiveauCompetence.DEBUTANT,
      categorie: CategorieCompetence.SOFT_SKILL
    };
    expect(minimalCompetence).toBeTruthy();
    expect(minimalCompetence.prerequis).toBeUndefined();
  });

  it('should have valid skill levels', () => {
    expect(Object.values(NiveauCompetence)).toContain(NiveauCompetence.DEBUTANT);
    expect(Object.values(NiveauCompetence)).toContain(NiveauCompetence.INTERMEDIAIRE);
    expect(Object.values(NiveauCompetence)).toContain(NiveauCompetence.AVANCE);
    expect(Object.values(NiveauCompetence)).toContain(NiveauCompetence.EXPERT);
  });

  it('should have valid skill categories', () => {
    expect(Object.values(CategorieCompetence)).toContain(CategorieCompetence.TECHNIQUE);
    expect(Object.values(CategorieCompetence)).toContain(CategorieCompetence.SOFT_SKILL);
    expect(Object.values(CategorieCompetence)).toContain(CategorieCompetence.METHODOLOGIE);
    expect(Object.values(CategorieCompetence)).toContain(CategorieCompetence.OUTIL);
  });

  it('should validate prerequisites array when present', () => {
    expect(Array.isArray(competence.prerequis)).toBeTruthy();
    expect(competence.prerequis?.every(prereq => typeof prereq === 'string')).toBeTruthy();
  });
}); 