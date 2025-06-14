// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-axe';

// Alternatively you can use CommonJS syntax:
// require('./commands')
// require('cypress-axe')

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here
      checkA11y: (context?: any, options?: any, violationCallback?: any) => Chainable<void>;
    }
  }
} 