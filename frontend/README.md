# PROGEASE Frontend

This project is the Angular frontend for the PROGEASE platform.

---

## 🚀 Features
- **Professional Back-Office and Front-Office templates** with responsive layouts, logo, and navigation
- **Dashboard, project, and livrable management pages** (see `/back-office` and `/front-office`)
- **Branding**: Uses the official PROGEASE logo and color scheme (dark, teal, gold)
- **Type-safe GraphQL integration** with codegen
- **Modern Angular best practices**

---

## 🖥️ Development Workflow

### 1. **Install dependencies**
```bash
npm install
```

### 2. **Run the development server**
```bash
ng serve
```
Navigate to [http://localhost:4200/](http://localhost:4200/)

### 3. **Back-Office & Front-Office**
- **Back-Office**: `/back-office` (admin, staff)
- **Front-Office**: `/front-office` (students, teams)

### 4. **Generate GraphQL Types/Services**
```bash
npm run codegen
```
- Requires backend running at `http://localhost:5000/graphql`
- Add `.graphql` files in `src/app/core/graphql/` and re-run codegen as needed

### 5. **Add New Features/Pages**
```bash
ng generate component path/to/feature
```
- Use the provided templates for consistent UI/UX

### 6. **Run Tests**
```bash
ng test
```

---

## 🎨 Branding & UI
- Logo: `src/assets/PROGEASE.png`
- Color scheme: dark background, teal/blue-green accents, gold highlights
- Responsive layouts for desktop and mobile

---

## 🛠️ Main Scripts
| Command            | Description                                 |
|--------------------|---------------------------------------------|
| `ng serve`         | Start dev server                            |
| `ng build`         | Build the project                           |
| `ng test`          | Run unit tests                              |
| `npm run codegen`  | Generate GraphQL types/services             |

---

## 🧩 Dependencies
- Angular 18+
- Apollo Angular (GraphQL)
- @graphql-codegen/cli, typescript, apollo-angular, operations
- (Optional) Angular Material, CDK for icons/UI

---

## 🤝 Contributing
- Use the CLI and templates for new features
- Keep code and UI consistent with the PROGEASE branding
- Run codegen and tests before submitting PRs

---

For more help, see the [Angular CLI docs](https://angular.dev/tools/cli) or contact the PROGEASE team.
