import { lighthouse, prepareAudit } from '@cypress-audit/lighthouse';

describe('Performance Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    prepareAudit();
  });

  it('should pass lighthouse audit for homepage', () => {
    cy.lighthouse({
      performance: 80,
      accessibility: 90,
      'best-practices': 85,
      seo: 90,
      pwa: 80,
    });
  });

  it('should pass lighthouse audit for dashboard', () => {
    // Login d'abord
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();

    // Attendre le chargement du dashboard
    cy.url().should('include', '/dashboard');
    cy.wait(1000); // Attendre le chargement complet

    cy.lighthouse({
      performance: 80,
      accessibility: 90,
      'best-practices': 85,
      seo: 90,
      pwa: 80,
    });
  });

  it('should measure page load performance', () => {
    cy.window().then((win) => {
      const performance = win.performance;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      // Vérifier le temps de chargement
      expect(navigation.domContentLoadedEventEnd - navigation.navigationStart).to.be.lessThan(2000);
      expect(navigation.loadEventEnd - navigation.navigationStart).to.be.lessThan(3000);
    });
  });

  it('should measure API response times', () => {
    cy.intercept('GET', '/api/**').as('apiCall');
    
    cy.visit('/dashboard');
    
    cy.wait('@apiCall').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.duration).to.be.lessThan(1000);
    });
  });
}); 