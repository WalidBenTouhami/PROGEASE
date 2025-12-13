# PROGEASE - Plateforme de Gestion de Projets

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
cd ../frontend && npm install --legacy-peer-deps
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