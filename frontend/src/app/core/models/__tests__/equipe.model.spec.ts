import { Equipe, StatutEquipe } from '../equipe.model';

describe('Equipe Model', () => {
  let equipe: Equipe;

  beforeEach(() => {
    equipe = {
      nom: 'Team Awesome',
      membres: ['user1', 'user2', 'user3'],
      projet: 'projet1',
      competencesPrincipales: ['Angular', 'Node.js'],
      forceEstimee: 8.5
    };
  });

  it('should create a valid team', () => {
    expect(equipe).toBeTruthy();
    expect(equipe.nom).toBe('Team Awesome');
    expect(equipe.membres.length).toBe(3);
    expect(equipe.competencesPrincipales).toContain('Angular');
  });

  it('should handle optional fields', () => {
    const minimalTeam: Equipe = {
      nom: 'Minimal Team',
      membres: ['user1'],
      competencesPrincipales: ['JavaScript']
    };
    expect(minimalTeam).toBeTruthy();
    expect(minimalTeam.projet).toBeUndefined();
    expect(minimalTeam.forceEstimee).toBeUndefined();
  });

  it('should have valid status values', () => {
    expect(Object.values(StatutEquipe)).toContain(StatutEquipe.EN_FORMATION);
    expect(Object.values(StatutEquipe)).toContain(StatutEquipe.ACTIVE);
    expect(Object.values(StatutEquipe)).toContain(StatutEquipe.INACTIVE);
    expect(Object.values(StatutEquipe)).toContain(StatutEquipe.DISSOUTE);
  });

  it('should validate team members array', () => {
    expect(Array.isArray(equipe.membres)).toBeTruthy();
    expect(equipe.membres.every(membre => typeof membre === 'string')).toBeTruthy();
  });
}); 