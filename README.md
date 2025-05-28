# PROGEASE

![PROGEASE Logo](./frontend/src/assets/PROGEASE.png)

[![CI](https://github.com/WalidBenTouhami/PROGEASE/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/WalidBenTouhami/PROGEASE/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/WalidBenTouhami/PROGEASE/branch/main/graph/badge.svg)](https://codecov.io/gh/WalidBenTouhami/PROGEASE)
[![Node.js Version](https://img.shields.io/badge/node-v16%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

---

## 🚀 Project Overview
**PROGEASE** is a modern, full-stack platform for managing student projects in an academic environment. It streamlines project and deliverable tracking, team collaboration, evaluation, and reporting, with advanced features like AI-powered analysis and automated documentation/testing.

---

## 🕵️ Comprehensive Code Audit (2025-05)

This section presents a detailed audit of the PROGEASE codebase, covering architecture, code quality, security, testing, type safety, and best practices.

### 1. Architecture & Structure
- **Monorepo**: Clean separation between `backend/` (Node.js/Express/MongoDB/Apollo) and `frontend/` (Angular 18+/Apollo Angular).
- **Backend**: Modular structure with `src/` containing `models`, `controllers`, `routes`, `middlewares`, `services`, `utils`, and `graphql`.
- **Frontend**: Modern Angular structure with `app/` split into `core/` (services, models, GraphQL), `back-office/`, `front-office/`, and feature modules.

### 2. Backend Audit
#### a. Security
- Uses `helmet` for HTTP headers, CORS with environment-based origins, and global rate limiting.
- Environment variables are validated; sensitive data is never exposed in logs.
- Password policy and JWT session config are present (verify user/auth endpoints).

#### b. Error Handling & Logging
- Centralized error handling for HTTP, process, and GraphQL errors, with custom `winston` logger.
- Process-level handlers for `uncaughtException`, `unhandledRejection`, `SIGTERM`, `SIGINT`.
- Standardized error responses and detailed logging.

#### c. Validation
- Input validation via `yup` and `express-validator`.
- Mongoose validation mapped to user-friendly errors.

#### d. API Design
- REST and GraphQL supported, with aligned models and endpoints.
- AI analysis route, `/health` endpoint, and auto-generated API docs.

#### e. Testing & Automation
- Jest for backend logic, Newman/Postman for API, CLI scripts for test/doc generation.
- CI/CD with GitHub Actions for lint, build, test, codegen, and docs.

#### f. Code Quality
- ESLint and Prettier configured, consistent naming, modularization.

### 3. Frontend Audit
#### a. Type Safety & Codegen
- Uses `@graphql-codegen` for TypeScript types and Angular services from backend schema.
- Models match backend enums and fields.

#### b. Authentication & Security
- Auth interceptor adds JWT to HTTP requests.
- Role handling in UI/models (verify login/registration flows).

#### c. UI/UX
- Responsive, branded layouts for back-office and front-office.
- Angular best practices: standalone components, modular routing, service injection.

#### d. Testing
- Jasmine/Karma for components/services, API test component, CI integration.

#### e. Code Quality
- ESLint, Prettier, EditorConfig, consistent structure.

### 4. DevOps & Automation
- GitHub Actions for backend/frontend, including codegen, lint, test, and doc generation.
- Badges for CI, coverage, Node version, license. Artifacts uploaded on every build.

### 5. Documentation & Contributor Experience
- Professional, up-to-date root and frontend READMEs.
- Auto-generated API docs, easy onboarding for new contributors.

### 6. Potential Gaps & Recommendations
- **User Authentication**: JWT and password policy are configured, but explicit user registration/login endpoints and UI should be verified.
- **Authorization Middleware**: Ensure all sensitive routes are protected in both REST and GraphQL.
- **E2E Testing**: Consider adding Cypress or Playwright for full-stack E2E tests.
- **Secrets Management**: Use environment variables or a secrets manager in production.
- **Monitoring**: Add health checks to CI/CD and consider uptime monitoring tools.
- **Accessibility**: Audit UI for accessibility (a11y) compliance.

### 7. Summary Table

| Area                | Status      | Notes                                                                 |
|---------------------|-------------|-----------------------------------------------------------------------|
| **Security**        | ✅ Good     | Helmet, CORS, rate limit, env validation, password policy, JWT config |
| **Error Handling**  | ✅ Robust   | Centralized, process-level, custom logger                             |
| **Validation**      | ✅ Strong   | Yup, express-validator, Mongoose, clear errors                        |
| **Testing**         | ✅ Automated| Jest, Postman/Newman, codegen, CI/CD                                  |
| **Type Safety**     | ✅ Excellent| GraphQL codegen, strict models, Angular types                         |
| **Code Quality**    | ✅ High     | ESLint, Prettier, modular, naming conventions                         |
| **Docs/Onboarding** | ✅ Excellent| Root/Frontend README, auto API docs, clear scripts                     |
| **UI/UX**           | ✅ Modern   | Responsive, branded, modular templates                                |
| **DevOps**          | ✅ Complete | CI/CD, badges, artifacts, codegen, test automation                    |
| **Potential Gaps**  | ⚠️ Review  | Explicit user auth flows, E2E tests, a11y, production secrets          |

---

## 🏗️ Architecture
```
[Frontend (Angular)] <-> [Backend (Node.js/Express/Apollo)] <-> [MongoDB]
```
- **Frontend**: Angular 18+, Apollo Angular, Material UI, responsive templates for back-office (admin/staff) and front-office (students/teams)
- **Backend**: Node.js, Express, MongoDB, Apollo Server (GraphQL), REST, security best practices
- **Database**: MongoDB (models: Projet, Livrable, etc.)

---

## 🌟 Key Features
- Project and deliverable (livrable) management (CRUD, search, filter)
- Role-based access (admin, tutor, student)
- Dashboards for both back-office and front-office
- AI-powered project analysis (optional)
- Automated API documentation and test generation (REST & GraphQL)
- Type-safe GraphQL integration with codegen
- Modern, branded UI with logo and color scheme
- CI/CD with GitHub Actions, code quality, and test coverage

---

## ⚡ Quick Start
### 1. **Clone the repository**
```bash
git clone https://github.com/WalidBenTouhami/PROGEASE.git
cd PROGEASE
```
### 2. **Install dependencies**
```bash
cd backend && npm install
cd ../frontend && npm install
```
### 3. **Seed the database**
```bash
cd ../backend
node seed.js
```
### 4. **Run the backend**
```bash
npm start
# or
node server.js
```
### 5. **Run the frontend**
```bash
cd ../frontend
ng serve
```
Visit [http://localhost:4200/](http://localhost:4200/)

---

## 📚 API Documentation & Test Automation
- **Generate API docs and tests:**
  ```bash
  cd backend
  node tools/test-generator.js --docs
  node tools/test-generator.js --graphql
  node tools/test-generator.js --rest
  ```
- **Docs output:** `backend/docs/`
- **Tests output:** `backend/tests/`
- **Postman collections and GraphQL test files auto-generated**

---

## 🧬 Frontend GraphQL Codegen
- **Generate types/services:**
  ```bash
  cd frontend
  npm run codegen
  ```
- **Requires backend running at** `http://localhost:5000/graphql`
- **Add .graphql files in** `src/app/core/graphql/` and re-run codegen as needed

---

## 🛡️ CI/CD & Quality Assurance
- **GitHub Actions**: Automated install, lint, build, test, codegen, and docs for both backend and frontend
- **Badges**: CI, code coverage, Node version, license
- **Artifacts**: API docs and test reports uploaded on every build

---

## 🧩 Technologies Used
- **Frontend**: Angular 18+, Apollo Angular, Material UI, SCSS
- **Backend**: Node.js, Express, Apollo Server, MongoDB, Mongoose
- **Testing**: Jest, Postman/Newman, GraphQL codegen
- **CI/CD**: GitHub Actions
- **Branding**: Custom logo, dark/teal/gold color scheme

---

## 🤝 Contributing
- Use the CLI and templates for new features
- Keep code and UI consistent with the PROGEASE branding
- Run codegen and tests before submitting PRs
- See `frontend/README.md` and `backend/README.md` for module-specific details

---

## 👥 Credits & Contact
- Main author: [Walid Ben Touhami](https://github.com/WalidBenTouhami)
- See contributors on GitHub
- For questions, open an issue or contact the team

---

## 📝 Notes
- **Logo**: `frontend/src/assets/PROGEASE.png`
- **Environment**: Node.js 16+, MongoDB 5+, Angular 18+
- **Deployment**: See CI/CD workflow and environment variable setup
- **License**: MIT

---

For more details, see the sub-READMEs in `backend/` and `frontend/`.