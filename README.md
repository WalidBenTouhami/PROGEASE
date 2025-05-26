
# PROGEASE - Plateforme de Gestion des Projets Étudiants

<!--suppress ALL -->
<p align="center">
  <img src="./assets/PROGEASE.png" alt="PROGEASE logo" width="400"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/node-v16+-green.svg" alt="Node" />
  <img src="https://img.shields.io/badge/mongodb-v5+-yellow.svg" alt="MongoDB" />
  <img src="https://img.shields.io/badge/license-MIT-orange.svg" alt="License" />
</p>

## 🚀 Introduction

**PROGEASE** est une plateforme centralisée conçue pour améliorer la gestion des projets étudiants dans un cadre universitaire. Elle aide les étudiants, tuteurs et administrateurs à gérer efficacement les projets grâce à des fonctionnalités innovantes telles que l'automatisation, la collaboration en temps réel, et l'analyse des performances des projets.

---

## 🧑‍💻 Équipe de Développement

| **Développeur**   | **Modules**               |
|-------------------|---------------------------|
| Ghofrane Toukebri | Formation & Certification |
| Yosr Ben Hammadi  | Système d'Évaluation      |
| Imen Ferchichi    | Gestion des Utilisateurs  |
| Karim Troudi      | Gestion du Forum          |
| Walid Ben Touhami | Gestion des Projets       |

---

## 🌟 Fonctionnalités Principales

### **Gestion des Projets**
- Ajouter, modifier et supprimer des projets
- Suivre l'avancement des projets en temps réel
- Prédire les performances grâce à des algorithmes d'IA

### **Gestion des Utilisateurs**
- Gestion des rôles : étudiant, tuteur, administrateur
- Authentification et autorisation sécurisées

### **Système d'Évaluation**
- Ajout et gestion des évaluations pour les projets
- Gestion des scores et des commentaires des évaluateurs

### **Formation et Certification**
- Gestion des formations et certifications pour les étudiants

### **Gestion du Forum**
- Création et gestion des discussions entre membres des équipes

### **Sécurité et Fiabilité**
- Authentification sécurisée avec validation via **Yup**
- Protection des données sensibles côté backend

<p align="center">
  <img src="./assets/Yup.png" alt="Validation Yup" width="400"/>
</p>

---

## 🛠️ Technologies Utilisées

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Node.js-43853d" alt="Node.js" />
  <img src="https://img.shields.io/badge/Backend-Express.js-000000" alt="Express.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248" alt="MongoDB" />
  <img src="https://img.shields.io/badge/AI-TensorFlow.js-FF6F00" alt="TensorFlow.js" />
  <img src="https://img.shields.io/badge/AI-scikit--learn-F7931E" alt="scikit-learn" />
  <img src="https://img.shields.io/badge/Validation-Yup-9B59B6" alt="Yup" />
</p>

---

## ⚙️ Installation et Configuration

### **Prérequis**
- Node.js (v16 ou supérieur)
- npm (v7 ou supérieur)
- MongoDB

### **Étapes d'installation**

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/username/progease.git
   cd progease
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement :**
   Créez un fichier `.env` à la racine du projet et ajoutez les variables suivantes :
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/progease
   CORS_ORIGINS=http://localhost:3000
   ```

4. **Lancer l'application :**
   ```bash
   npm start
   ```

5. **Accéder à l'application :**
   - **API REST** : [http://localhost:5000/api](http://localhost:5000/api)
   - **GraphQL Playground** : [http://localhost:5000/graphql](http://localhost:5000/graphql)

---

## 🧪 Tests

Pour exécuter les tests Jest, utilisez la commande suivante :
```bash
npm test
npm run test:api

```

### **Tests API avec Newman**

Pour exécuter les tests API avec la collection Postman :
```bash
npm run test:api
```

Ou manuellement :
```PowerShell
newman run tests/postman/PROGEASE.postman_collection.json -e tests/postman/PROGEASE.postman_environment.json --global-var "currentUser=WalidBenTouhami" --global-var "timestamp=2025-05-26T14:31:44" -r cli -r htmlextra --reporter-htmlextra-export "reports/newman/rapport-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').html"
```
Le raport de test sera généré dans le dossier `reports/newman`.

### **Types de tests inclus :**
- Tests unitaires pour les modules principaux
- Tests d'intégration pour les routes REST et GraphQL
- Tests automatisés via Postman/Newman

---

## 📂 Structure Globale du Backend

### **Structure des Dossiers**
<details>
  <summary>📂 Cliquez pour afficher la structure</summary>

```
backend
|-- config
|   |-- constants.js
|   `-- db.json
|-- newman-tests.js
|-- package-lock.json
|-- package.json
|-- reports
|   `-- newman
|-- server.js
|-- tests
|   |-- integration
|   |-- postman
|   |   |-- PROGEASE.postman_collection.json
|   |   `-- PROGEASE.postman_environment.json
|   `-- unit
`-- src
    |-- controllers
    |   |-- evaluation.controller.js
    |   |-- formation&certification.controller.js
    |   |-- forum.controller.js
    |   |-- projet.controller.js
    |   `-- user.controller.js
    |-- middlewares
    |   |-- evaluation.middleware.js
    |   |-- formation&certification.middleware.js
    |   |-- forum.middleware.js
    |   |-- projet.middleware.js
    |   `-- user.middleware.js
    |-- models
    |   |-- evaluation.model.js
    |   |-- formation&certification.model.js
    |   |-- forum.model.js
    |   |-- projet.model.js
    |   `-- user.model.js
    |-- routers
    |   |-- evaluation.router.js
    |   |-- formation&certification.router.js
    |   |-- forum.router.js
    |   |-- projet.routes.js
    |   `-- user.router.js
    |-- schema.js
    |-- services
    |   |-- evaluation.service.js
    |   |-- formation&certification.service.js
    |   |-- forum.service.js
    |   |-- projet.service.js
    |   `-- user.service.js
    `-- utils
        |-- date.util.js
        `-- github.util.js
```

</details>

---

## 📂 Structure Globale du Frontend

### **Structure des Dossiers**
<details>
  <summary>📂 Cliquez pour afficher la structure</summary>

```
frontend
|-- README.md
|-- angular.json
|-- package-lock.json
|-- package.json
|-- proxy.conf.json
|-- public
|   `-- favicon.ico
|-- server.ts
|-- src
|   |-- android-chrome-512x512.png
|   |-- app
|   |   |-- app-routing.module.ts
|   |   |-- app.component.css
|   |   |-- app.component.html
|   |   |-- app.component.spec.ts
|   |   |-- app.component.ts
|   |   |-- app.config.server.ts
|   |   |-- app.config.ts
|   |   |-- app.module.ts
|   |   |-- app.routes.ts
|   |   |-- back-office
|   |   |   |-- back-office-routing.module.ts
|   |   |   |-- back-office.module.ts
|   |   |   |-- dashboard
|   |   |   |-- deliverable-management
|   |   |   `-- project-management
|   |   |-- core
|   |   |   |-- api-test
|   |   |   |-- apollo.config.ts
|   |   |   |-- interceptors
|   |   |   |-- models
|   |   |   `-- services
|   |   |-- deliverable
|   |   |   |-- deliverable-detail
|   |   |   |-- deliverable-form
|   |   |   |-- deliverable-list
|   |   |   |-- livrable-routing.module.ts
|   |   |   `-- livrable.module.ts
|   |   |-- front-office
|   |   |   |-- dashboard
|   |   |   |-- deliverable-list
|   |   |   |-- front-office-routing.module.ts
|   |   |   |-- front-office.module.ts
|   |   |   `-- project-list
|   |   `-- project
|   |       |-- project-detail
|   |       |-- project-form
|   |       |-- project-list
|   |       |-- projet-routing.module.ts
|   |       `-- projet.module.ts
|   |-- environments
|   |   |-- environment.prod.ts
|   |   `-- environment.ts
|   |-- index.html
|   |-- main.server.ts
|   |-- main.ts
|   |-- polyfills.ts
|   `-- styles.css
|-- tsconfig.app.json
|-- tsconfig.json
`-- tsconfig.spec.json
```

</details>

---

## 📊 Modules et Arborescence

<p align="center">
  <img src="./assets/Tree%20map.png" alt="Arborescence des modules" width="1600"/>
</p>

---

## 🤝 Contributions

Les contributions sont les bienvenues ! Veuillez suivre ces étapes pour proposer des modifications :

1. **Forkez le dépôt**
2. **Créez une branche pour vos modifications**
   ```bash
   git checkout -b feature/nom-feature
   ```
3. **Effectuez vos modifications et commitez**
   ```bash
   git commit -m "Description de vos changements"
   ```
4. **Poussez vers votre fork**
   ```bash
   git push origin feature/nom-feature
   ```
5. **Soumettez un pull request**

N'hésitez pas à ouvrir une issue pour discuter des améliorations.

---

## 📜 Licence

Ce projet est sous licence **MIT**. Consultez le fichier `LICENSE` pour plus de détails.

---

## 🔗 Liens Utiles

- **Documentation API** : [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Documentation GraphQL** : [http://localhost:5000/graphql](http://localhost:5000/graphql)
- **Tableau Kanban** : [https://trello.com/b/progease](https://trello.com/b/progease)

---

<p align="center">
  <sub>Développé avec ❤️ par l'équipe PROGEASE - Dernière mise à jour: 2025-05-23 par WalidBenTouhami</sub>
</p>
```