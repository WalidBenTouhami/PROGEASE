import 'cypress-axe';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.injectAxe();
  });

  it('should have no accessibility violations on homepage', () => {
    cy.visit('/');
    cy.checkA11y();
  });

  it('should have no accessibility violations on login page', () => {
    cy.visit('/login');
    cy.checkA11y();
  });

  it('should have no accessibility violations on dashboard', () => {
    // Login first
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();

    // Check dashboard accessibility
    cy.url().should('include', '/dashboard');
    cy.checkA11y();
  });

  it('should have proper ARIA labels', () => {
    cy.visit('/');
    
    // Check navigation
    cy.get('nav').should('have.attr', 'aria-label', 'Main navigation');
    
    // Check form elements
    cy.get('input').each(($input) => {
      cy.wrap($input).should('have.attr', 'aria-label');
    });
    
    // Check buttons
    cy.get('button').each(($button) => {
      if (!$button.attr('aria-label')) {
        cy.wrap($button).should('have.text');
      }
    });
  });

  it('should maintain proper heading hierarchy', () => {
    cy.visit('/');
    
    // Get all headings
    cy.get('h1, h2, h3, h4, h5, h6').then(($headings) => {
      let previousLevel = 0;
      
      $headings.each((index, heading) => {
        const level = parseInt(heading.tagName[1]);
        
        // Check for skipped levels
        if (level - previousLevel > 1) {
          throw new Error(`Heading hierarchy skipped from h${previousLevel} to h${level}`);
        }
        
        previousLevel = level;
      });
    });
  });

  it('should have sufficient color contrast', () => {
    cy.visit('/');
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  it('should be keyboard navigable', () => {
    cy.visit('/');
    
    // Test tab navigation
    cy.get('body').tab();
    cy.focused().should('exist');
    
    // Test focus indicators
    cy.get('a, button, input, select, textarea').each(($el) => {
      cy.wrap($el).focus();
      cy.wrap($el).should('have.css', 'outline').and('not.eq', 'none');
    });
  });
}); 