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

```bash
# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Démarrage du serveur de développement
npm run dev
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