describe('Security Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should prevent XSS attacks', () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    cy.get('[data-cy=search-input]').type(xssPayload);
    cy.get('[data-cy=search-button]').click();
    
    // Vérifier que le script n'est pas exécuté
    cy.on('window:alert', () => {
      throw new Error('XSS attack succeeded');
    });
    
    // Vérifier que le contenu est échappé
    cy.get('[data-cy=search-results]')
      .should('contain', xssPayload)
      .and('not.have.html', xssPayload);
  });

  it('should prevent CSRF attacks', () => {
    cy.request({
      method: 'POST',
      url: '/api/utilisateurs',
      body: {
        email: 'attacker@example.com',
        password: 'password123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(403);
    });
  });

  it('should enforce password complexity', () => {
    cy.visit('/register');
    
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('weak');
    cy.get('[data-cy=register-button]').click();
    
    cy.get('[data-cy=password-error]')
      .should('be.visible')
      .and('contain', 'Le mot de passe doit contenir au moins 8 caractères');
  });

  it('should prevent brute force attacks', () => {
    // Tenter plusieurs connexions échouées
    for (let i = 0; i < 5; i++) {
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-button]').click();
    }
    
    // Vérifier que le compte est temporairement bloqué
    cy.get('[data-cy=error-message]')
      .should('be.visible')
      .and('contain', 'Trop de tentatives de connexion');
  });

  it('should enforce secure headers', () => {
    cy.request('/').then((response) => {
      expect(response.headers).to.include({
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'x-xss-protection': '1; mode=block',
        'strict-transport-security': 'max-age=31536000; includeSubDomains'
      });
    });
  });
}); 