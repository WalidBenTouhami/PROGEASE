# PROGEASE Project

<p align="center">
  <img src="assets/PROGEASE.png" alt="PROGEASE logo" width="400"/>
</p>

## ÉQUIPE DE DÉVELOPPEMENT

| **Développeur**         | **Modules**               |
|--------------------------|---------------------------|
| Ghofrane Toukebri        | Formation & Certification |
| Yosr Ben Hammadi         | Système d'Évaluation      |
| Imen Ferchichi           | Gestion des Utilisateurs  |
| Karim Troudi             | Gestion du Forum          |
| Walid Ben Touhami        | Gestion des Projets       |

---

## DESCRIPTION DU PROJET

PROGEASE est une plateforme centralisée conçue pour simplifier la gestion des projets étudiants dans un cadre universitaire. Elle permet aux utilisateurs (étudiants, tuteurs et administrateurs) de :

- Ajouter et gérer des sujets de projet.
- Affecter des équipes et des tuteurs.
- Suivre l'avancement des projets en temps réel.
- Évaluer les résultats des projets.
- Automatiser certaines tâches comme la prédiction des performances et l'attribution intelligente de tuteurs.

L'objectif principal est de fournir une solution intuitive et efficace pour améliorer la collaboration et le suivi des projets.

---

## FONCTIONNALITÉS PRINCIPALES

### **Gestion des Projets**
- Création, mise à jour et suppression de projets.
- Suivi de la progression des projets.
- Prédiction des performances des projets grâce à des algorithmes d'IA.

### **Gestion des Utilisateurs**
- Gestion des rôles (étudiant, tuteur, administrateur).
- Authentification et autorisation sécurisées.

### **Système d'Évaluation**
- Ajout d'évaluations pour les projets.
- Gestion des scores et des commentaires des évaluateurs.

### **Formation et Certification**
- Gestion des formations et certifications liées aux projets.

### **Gestion du Forum**
- Création de discussions et échanges entre les membres des équipes.

### **Sécurité et Fiabilité**
- Gestion des authentifications et des autorisations.
- Validation côté frontend assurée avec **Yup**, garantissant des formulaires robustes, typés et sécurisés avant toute soumission au backend.

<p align="center">
  <img src="assets/Yup.png" alt="PROGEASE logo" width="400"/>
</p>
---

## TECHNOLOGIES UTILISÉES

- **Backend** : Node.js, Express.js
- **Base de données** : MongoDB
- **AI** : TensorFlow.js, scikit-learn

---

## INSTALLATION ET CONFIGURATION

### **Prérequis**
- Node.js (v16 ou supérieur)
- npm (v7 ou supérieur)
- MongoDB


### **Étapes d'installation**

1. **Cloner le dépôt :**
   ```bash
   git clone <URL_DU_DEPOT>
   cd <NOM_DU_DEPOT>

Installer les dépendances :

npm install
Configurer les variables d'environnement : Créez un fichier .env à la racine du projet et ajoutez les variables suivantes :


PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/progease
CORS_ORIGINS=http://localhost:3000
Lancer l'application :


npm start
Accéder à l'application :

API REST : http://localhost:4000/api/v1/
GraphQL Playground : http://localhost:4000/graphql
<hr></hr>

TESTS
Pour exécuter les tests, utilisez la commande suivante :
npm test

Les tests incluent :
Tests unitaires pour les modules principaux.
Tests d'intégration pour les routes REST et GraphQL.


## STRUCTURE GLOBALE DU BACKEND

### LES MODULES


<p align="left">
  <img src="assets/Tree map.png" alt="Les modules" width="1600"/>
</p>


### Structure du Backend

<details>
  <summary>📂 Cliquez pour afficher la structure</summary>


```
backend
|-- config
|   |-- constants.js
|   `-- db.json
|-- package-lock.json
|-- package.json
|-- server.js
`-- src
    |-- controllers
    |   |-- evaluation.controller.js
    |   |-- formation&certification.controller.js
    |   |-- forum.controller.js
    |   |-- project.controller.js
    |   `-- user.controller.js
    |-- middlewares
    |   |-- evaluation.middleware.js
    |   |-- formation&certification.middleware.js
    |   |-- forum.middleware.js
    |   |-- project.middleware.js
    |   `-- user.middleware.js
    |-- models
    |   |-- evaluation.model.js
    |   |-- formation&certification.model.js
    |   |-- forum.model.js
    |   |-- project.model.js
    |   `-- user.model.js
    |-- routers
    |   |-- evaluation.router.js
    |   |-- formation&certification.router.js
    |   |-- forum.router.js
    |   |-- project.router.js
    |   `-- user.router.js
    |-- schema.js
    |-- services
    |   |-- evaluation.service.js
    |   |-- formation&certification.service.js
    |   |-- forum.service.js
    |   |-- project.service.js
    |   `-- user.service.js
    `-- utils
        |-- date.util.js
        `-- github.util.js

```


</details>


CONTRIBUTIONS
Les contributions sont les bienvenues !
Veuillez soumettre un pull request ou ouvrir une issue pour discuter des changements.

<hr></hr>
LICENCE
Ce projet est sous licence MIT.




