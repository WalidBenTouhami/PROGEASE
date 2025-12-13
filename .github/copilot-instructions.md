# PROGEASE - Copilot Instructions

## Project Overview

PROGEASE is a project management platform with AI-powered features, built using a monorepo structure with separate backend and frontend applications.

### Architecture
- **Backend**: Node.js/Express with GraphQL (Apollo Server) and REST APIs, MongoDB database
- **Frontend**: Angular with Material Design, Apollo Client for GraphQL, NgRx for state management
- **Monorepo Structure**: Root package.json with separate backend/ and frontend/ directories, each with their own dependencies and package.json files

## Technology Stack

### Backend
- **Framework**: Express.js ^4.18.2
- **API**: GraphQL (Apollo Server) + REST endpoints
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcryptjs
- **Testing**: Jest with MongoDB Memory Server
- **Validation**: express-validator, Joi, Yup
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize, xss-clean, hpp

### Frontend
- **Framework**: Angular ^17.3.0 with standalone components
- **UI Library**: Angular Material
- **State Management**: NgRx (Store, Effects, Entity)
- **GraphQL Client**: Apollo Angular
- **Styling**: SCSS with Tailwind CSS
- **Testing**: Jasmine/Karma for unit tests, Cypress for e2e tests
- **Charts**: ng2-charts with Chart.js

## Code Style and Formatting

### Backend (Node.js/JavaScript)
- **Linter**: ESLint with Prettier integration
- **Formatter**: Prettier
- **Style**:
  - Use single quotes for strings
  - Semicolons required
  - **4-space indentation** (backend convention for Node.js)
  - Max line length: 120 characters
  - Arrow functions: avoid parentheses for single parameters
  - Trailing commas: ES5 style
  - Use `const` over `let`, never use `var`
  - Strict equality (`===`) always
  - Console logs: only `console.warn`, `console.error`, `console.info` allowed (not `console.log`)

### Frontend (Angular/TypeScript)
- **Linter**: Angular ESLint
- **Formatter**: EditorConfig + Prettier
- **Style**:
  - Use single quotes for strings
  - **2-space indentation** (frontend convention following Angular style guide)
  - Standalone components preferred
  - Component prefix: `app-`
  - SCSS for styling
  - Follow Angular style guide

## File Naming Conventions

### Backend
- **Models**: `<entity>.model.js` (e.g., `utilisateur.model.js`, `projet.model.js`)
- **Controllers**: `<entity>.controller.js` or `<entity>Controller.js`
- **Routes**: `<entity>.routes.js` or `<entity>Routes.js` (e.g., `utilisateur.routes.js`)
- **Services**: `<entity>.service.js`
- **Tests**: `<name>.test.js` or `<name>.spec.js`
- **GraphQL schemas**: `<entity>.graphql`

### Frontend
- **Components**: kebab-case (e.g., `user-list.component.ts`)
- **Services**: kebab-case with `.service.ts` suffix
- **Models/Interfaces**: kebab-case with `.model.ts` or `.interface.ts` suffix
- **Guards**: kebab-case with `.guard.ts` suffix
- **Interceptors**: kebab-case with `.interceptor.ts` suffix

## Directory Structure

### Backend (`/backend/src/`)
```
├── controllers/     # Request handlers
├── models/         # Mongoose models
├── routes/         # Express route definitions
├── services/       # Business logic
├── graphql/        # GraphQL schemas and resolvers
├── utils/          # Utility functions
└── config/         # Configuration files
```

### Frontend (`/frontend/src/app/`)
```
├── core/           # Core module (guards, interceptors)
├── features/       # Feature modules (admin, ai, etc.)
├── services/       # Application services
├── models/         # TypeScript interfaces/models
└── shared/         # Shared components, pipes, directives
```

## Development Commands

### Installation
```bash
# Install all dependencies (root, backend, and frontend)
npm run install-all

# Install backend only
cd backend && npm install

# Install frontend only
cd frontend && npm install
```

### Running the Application
```bash
# Start both backend and frontend
npm start

# Start backend only (development mode with nodemon)
cd backend && npm run dev

# Start frontend only (Angular dev server)
cd frontend && npm start
```

### Testing
```bash
# Backend tests
cd backend && npm test                    # Run all tests
cd backend && npm run test:watch          # Watch mode
cd backend && npm run test:coverage       # With coverage

# Frontend tests
cd frontend && npm test                   # Karma unit tests
cd frontend && npm run test:ci            # CI mode (headless)
cd frontend && npm run test:e2e           # Cypress e2e tests
cd frontend && npm run test:security      # Security tests
cd frontend && npm run test:accessibility # Accessibility tests
```

### Building
```bash
# Backend build
cd backend && npm run build

# Frontend build
cd frontend && npm run build
```

### Linting
```bash
# Backend linting
cd backend && npm run lint

# Frontend linting
cd frontend && npm run lint
```

## API Design Conventions

### GraphQL
- GraphQL schemas located in: `backend/src/graphql/schemas/`
- Resolvers located in: `backend/src/graphql/resolvers/`
- Use DataLoader for batching and caching
- Follow GraphQL naming conventions (camelCase for fields)
- Test files in: `backend/tests/graphql/`

### REST
- RESTful endpoints follow pattern: `/api/<entity>/<action>`
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response format
- Apply validation middleware
- Routes defined in: `backend/src/routes/`

## Security Practices

### Backend
- Always validate and sanitize user input
- Use `express-mongo-sanitize` to prevent NoSQL injection
- Use `xss-clean` for XSS protection
- Use `helmet` for security headers
- Apply rate limiting with `express-rate-limit`
- Use `hpp` to protect against HTTP parameter pollution
- Never log sensitive information
- Use JWT for authentication
- Hash passwords with bcryptjs

### Frontend
- Sanitize user input before displaying
- Implement guards for route protection
- Use interceptors for token management
- Follow OWASP security guidelines
- Implement CSRF protection

## Testing Conventions

### Backend
- Use Jest as test framework
- Test files alongside source files or in `/tests` directory
- Use MongoDB Memory Server for database tests
- Mock external dependencies
- Test file naming: `*.test.js` or `*.spec.js`
- Allow console.log in test files only

### Frontend
- Use Jasmine/Karma for unit tests
- Use Cypress for e2e tests
- Test file naming: `*.spec.ts` for unit tests
- E2e tests in: `cypress/e2e/`
- Mock HTTP requests in unit tests
- Test coverage required

## Error Handling

### Backend
- Use centralized error handling middleware
- Return consistent error response format
- Log errors with Winston logger
- Include appropriate HTTP status codes
- Never expose stack traces in production

### Frontend
- Use interceptors for global error handling
- Display user-friendly error messages
- Use notification service for error display
- Log errors to monitoring service (Sentry)

## Database Conventions

- Use Mongoose for MongoDB interactions
- Define models with validation schemas
- Use virtuals for computed properties
- Implement pre/post hooks for business logic
- Use indexes for frequently queried fields
- Use transactions for multi-document operations

## Version Requirements

- **Node.js**: 
  - Backend: >=18.0.0 (LTS compatible)
  - Frontend: >=20.0.0 (required for Angular 17.3+ features and optimal performance)
- **npm**: >=10.0.0
- **MongoDB**: 5.0+

**Note**: The different Node.js versions reflect the specific requirements of each stack. The backend uses Node 18+ for stability, while the frontend requires Node 20+ for optimal Angular 17.3 performance and modern ECMAScript features.

## Additional Notes

- The project uses GraphQL Code Generator for TypeScript types
- Apollo Federation is configured for microservices architecture
- Server-side rendering (SSR) is enabled for Angular
- Cypress is configured for comprehensive e2e testing including security, accessibility, and performance tests
- Winston is used for backend logging
- Morgan is used for HTTP request logging
- The project follows French language conventions for some model/route names (e.g., `utilisateur`, `projet`, `livrable`)

## When Making Changes

1. **Always run tests** after making changes to ensure nothing breaks
2. **Follow existing patterns** - look at similar files for consistency
3. **Update documentation** if adding new features or changing behavior
4. **Validate input** - always validate and sanitize user input
5. **Check security** - ensure changes don't introduce vulnerabilities
6. **Format code** - run linter and formatter before committing
7. **Write tests** - add tests for new functionality
8. **Use TypeScript types** - for frontend code, ensure proper typing
9. **Handle errors** - implement proper error handling for all edge cases
10. **Consider performance** - especially for database queries and API calls
