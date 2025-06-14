describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();

    // Vérifier la redirection vers le tableau de bord
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy=user-menu]').should('be.visible');
  });

  it('should show error message with invalid credentials', () => {
    cy.get('[data-cy=email-input]').type('invalid@example.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    cy.get('[data-cy=login-button]').click();

    // Vérifier le message d'erreur
    cy.get('[data-cy=error-message]')
      .should('be.visible')
      .and('contain', 'Identifiants invalides');
  });

  it('should logout successfully', () => {
    // Login d'abord
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();

    // Vérifier que nous sommes connectés
    cy.url().should('include', '/dashboard');

    // Déconnexion
    cy.get('[data-cy=user-menu]').click();
    cy.get('[data-cy=logout-button]').click();

    // Vérifier la redirection vers la page de login
    cy.url().should('include', '/login');
  });

  it('should handle session timeout', () => {
    // Login
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();

    // Simuler l'expiration de la session
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'expired-token');
    });

    // Rafraîchir la page
    cy.reload();

    // Vérifier la redirection vers la page de login
    cy.url().should('include', '/login');
    cy.get('[data-cy=session-expired-message]')
      .should('be.visible')
      .and('contain', 'Session expirée');
  });
}); 