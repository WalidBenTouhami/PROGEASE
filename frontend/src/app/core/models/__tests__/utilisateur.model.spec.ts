import { Utilisateur, RoleUtilisateur } from '../utilisateur.model';

describe('Utilisateur Model', () => {
  let utilisateur: Utilisateur;

  beforeEach(() => {
    utilisateur = {
      nom: 'John Doe',
      email: 'john.doe@example.com',
      role: RoleUtilisateur.ETUDIANT,
      competences: ['JavaScript', 'Angular'],
      projets: ['projet1', 'projet2'],
      disponibilite: true
    };
  });

  it('should create a valid user', () => {
    expect(utilisateur).toBeTruthy();
    expect(utilisateur.nom).toBe('John Doe');
    expect(utilisateur.email).toBe('john.doe@example.com');
    expect(utilisateur.role).toBe(RoleUtilisateur.ETUDIANT);
  });

  it('should have optional fields', () => {
    const minimalUser: Utilisateur = {
      nom: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: RoleUtilisateur.TUTEUR
    };
    expect(minimalUser).toBeTruthy();
    expect(minimalUser.competences).toBeUndefined();
    expect(minimalUser.projets).toBeUndefined();
  });

  it('should have valid role values', () => {
    expect(Object.values(RoleUtilisateur)).toContain(RoleUtilisateur.ADMIN);
    expect(Object.values(RoleUtilisateur)).toContain(RoleUtilisateur.TUTEUR);
    expect(Object.values(RoleUtilisateur)).toContain(RoleUtilisateur.ETUDIANT);
  });
}); 