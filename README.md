# PROGEASE - Plateforme de Gestion de Projets

<!-- Badges Section -->
<div align="center">

[![CI Status](https://github.com/WalidBenTouhami/PROGEASE/workflows/PROGEASE%20CI/badge.svg)](https://github.com/WalidBenTouhami/PROGEASE/actions/workflows/ci.yml)
[![Test Status](https://github.com/WalidBenTouhami/PROGEASE/workflows/Test/badge.svg)](https://github.com/WalidBenTouhami/PROGEASE/actions/workflows/test.yml)
[![CodeQL](https://github.com/WalidBenTouhami/PROGEASE/workflows/CodeQL%20Advanced/badge.svg)](https://github.com/WalidBenTouhami/PROGEASE/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Node.js Backend](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Node.js Frontend](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-%3E%3D10.0.0-blue.svg)](https://www.npmjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0%2B-green.svg)](https://www.mongodb.com/)

[![Angular](https://img.shields.io/badge/Angular-18.2.14-red.svg)](https://angular.io/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-lightgrey.svg)](https://expressjs.com/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16.8.1-e10098.svg)](https://graphql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue.svg)](https://www.typescriptlang.org/)

[![Security: Helmet](https://img.shields.io/badge/Security-Helmet-brightgreen.svg)](https://helmetjs.github.io/)
[![Rate Limiting](https://img.shields.io/badge/Rate%20Limiting-Enabled-brightgreen.svg)](https://www.npmjs.com/package/express-rate-limit)
[![Input Validation](https://img.shields.io/badge/Input%20Validation-Enabled-brightgreen.svg)](https://express-validator.github.io/)
[![XSS Protection](https://img.shields.io/badge/XSS-Protected-brightgreen.svg)](https://www.npmjs.com/package/xss-clean)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Maintained](https://img.shields.io/badge/Maintained-Yes-green.svg)](https://github.com/WalidBenTouhami/PROGEASE/graphs/commit-activity)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Linter: ESLint](https://img.shields.io/badge/linter-eslint-4B32C3.svg)](https://eslint.org/)

</div>

---

## 📊 Aperçu des Badges

Les badges ci-dessus démontrent l'engagement du projet envers la qualité, la sécurité et les meilleures pratiques :

- **🔄 CI/CD** : Intégration et déploiement continus avec tests automatisés
- **🔒 Sécurité** : Multiples couches de protection (Helmet, Rate Limiting, XSS, Input Validation)
- **📦 Technologies** : Stack moderne et maintenu (Angular 18, Node.js, GraphQL)
  - *Note: Backend nécessite Node.js ≥18.0.0 (LTS), Frontend nécessite Node.js ≥20.0.0 pour les fonctionnalités Angular 18 et performances optimales*
- **✅ Qualité du Code** : Linting (ESLint) et formatage automatique (Prettier)
- **🛡️ Analyse** : Scan de sécurité automatique avec CodeQL
- **📝 Licence** : Open source sous licence MIT

## Fonctionnalités

### Administration
- Gestion des utilisateurs
  - Création, modification, suppression d'utilisateurs
  - Gestion des rôles (ADMIN, USER, MANAGER)
  - Suivi des connexions
- Tableau de bord des statistiques
  - Nombre total d'utilisateurs
  - Utilisateurs actifs
  - Projets en cours et terminés
  - Taux de completion

### Intelligence Artificielle
- Analyse de projets
  - Analyse automatique des projets
  - Génération de recommandations
  - Évaluation des livrables
  - Rapports d'avancement
- Formation intelligente d'équipes
  - Optimisation basée sur les compétences
  - Équilibrage des niveaux d'expérience
  - Respect des préférences de collaboration
- Association intelligente tuteurs-projets
  - Matching basé sur les compétences
  - Équilibrage de la charge des tuteurs
  - Compatibilité thématique
- Analyse prédictive de performance
  - Prédiction des résultats
  - Identification des risques
  - Tendances de progression
- Suivi automatisé de progression
  - Calcul automatique du pourcentage d'avancement
  - Statistiques en temps réel
  - Alertes sur les retards
- Ressources d'apprentissage personnalisées
  - Recommandations de cours en ligne
  - Suggestions de livres et projets pratiques
  - Communautés d'apprentissage
- Planification automatisée et rappels
  - Génération automatique de planning
  - Rappels intelligents pour les échéances
  - Détection de conflits d'horaires
  - Planification de réunions et soutenances

### Gestion des Sessions
- Authentification sécurisée
- Rafraîchissement automatique des tokens
- Gestion de l'inactivité
- Déconnexion automatique

### Notifications
- Système de notifications en temps réel
- Types de notifications :
  - Succès (vert)
  - Erreur (rouge)
  - Information (bleu)
  - Avertissement (orange)
- Animations fluides

## Installation

### Prérequis

- **Node.js**: >=18.0.0 (backend), >=20.0.0 (frontend)
- **npm**: >=10.0.0
- **MongoDB**: 5.0+
- **Python**: 3.6+ (pour le script d'installation automatique)

### Méthode 1: Script Python (Recommandé)

```bash
# Installation automatique de toutes les dépendances
python3 install_all.py

# Options disponibles:
python3 install_all.py --clean           # Nettoyer node_modules avant installation
python3 install_all.py --backend-only    # Installer uniquement le backend
python3 install_all.py --frontend-only   # Installer uniquement le frontend
python3 install_all.py --help            # Afficher l'aide
```

### Méthode 2: Script npm

```bash
# Installation de toutes les dépendances (root, backend, frontend)
npm run install-all

# Nettoyage complet
npm run clean
```

### Méthode 3: Installation manuelle

```bash
# Installation des dépendances root
npm install

# Installation des dépendances backend
cd backend && npm install

# Installation des dépendances frontend
# Note: --legacy-peer-deps est configuré dans frontend/.npmrc mais peut être spécifié explicitement
cd ../frontend && npm install
```

### Configuration de l'environnement

```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer .env avec vos configurations
# (MongoDB URI, JWT secrets, etc.)
```

### Démarrage du serveur de développement

```bash
# Démarrer backend et frontend simultanément
npm start

# Ou séparément:
cd backend && npm run dev      # Backend seulement
cd frontend && npm start        # Frontend seulement
```

## API REST

### Endpoints IA

```bash
# Formation d'équipes intelligente
POST /api/ai/form-teams
Body: { membres: [{ id, nom, competences, ... }] }

# Association de tuteurs
POST /api/ai/match-tutors
Body: { membres: [{ id, role, competences, ... }] }

# Recommandations d'apprentissage
POST /api/ai/learning-resources
Body: { competences: ["JavaScript", "React", ...] }

# Suivi de progression
POST /api/ai/track-progress
Body: { taches: [{ titre, statut, ... }] }

# Prédiction de performance
POST /api/ai/predict-performance/:projetId
Body: { historique: [...] }

# Génération de planning
POST /api/ai/generate-schedule
Body: { taches: [...], dateDebut, dateFin }

# Analyse de projet
POST /api/ai/analyze
Body: { projetId, contenu, type }
```

### Endpoints Planification

```bash
# Génération de rappels
GET /api/scheduling/reminders/:projetId

# Planification d'événements
POST /api/scheduling/events/:projetId
Body: { type: "REUNION", frequence: "HEBDOMADAIRE" }

# Envoi de notifications
POST /api/scheduling/notifications
Body: { rappels: [...] }

# Détection de conflits
POST /api/scheduling/conflicts
Body: { evenements: [...] }

# Planning complet
GET /api/scheduling/complete/:projetId
```

## Tests

```bash
# Exécution des tests unitaires
npm test

# Exécution des tests avec couverture
npm run test:coverage
```

## Structure du Projet

```
frontend/
  ├── src/
  │   ├── app/
  │   │   ├── core/
  │   │   │   ├── guards/
  │   │   │   └── interceptors/
  │   │   ├── features/
  │   │   │   ├── admin/
  │   │   │   └── ai/
  │   │   └── services/
  │   └── styles/
  └── tests/

backend/
  ├── src/
  │   ├── controllers/
  │   ├── routes/
  │   ├── services/
  │   └── utils/
  └── tests/
```

## Sécurité

- Protection CSRF
- Rate limiting
- Validation des entrées
- Gestion sécurisée des sessions
- Chiffrement des données sensibles

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.