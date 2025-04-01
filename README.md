# PROGEASE Project

<p align="center">
  <img src="assets/PROGEASE.png" alt="PROGEASE logo" width="400"/>
</p>

## EQUIPE DE DEVELOPPEMENT

|     **Développeur**      |     **Modules**           |
|-------------------------|----------------------------|
| Ghofrane Toukebri       | formation-certification    |
| Yosr Ben Hammadi        | evaluation-system          |
| Imen Ferchichi          | user-management            |
| Karim Troudi            | forum-management           |
| Walid Ben Touhami       | project-management         |


## DESCRIPTION
Notre projet vise à fournir une plateforme centralisée pour la gestion des projets étudiants au sein d’un établissement universitaire. 
L’application permettra aux utilisateurs d’ajouter des sujets de projet, d’affecter des équipes et des tuteurs, de suivre l’avancement des projets et d’évaluer les résultats.
L’objectif est de simplifier le suivi de chaque projet en offrant une gestion claire et accessible à toutes les parties prenantes : étudiants, tuteurs et administrateurs. 


## Structure Globale du Backend

### Structure du Backend
<details>
<summary>Cliquez pour afficher la structure</summary>

backend/
├── .env
├── Dockerfile
├── package.json
├── package-lock.json
├── logs/
└── src/
    ├── app.js
    ├── config/
    │   ├── db.js
    │   ├── constants.js
    │   └── logging.js
    ├── core/
    │   └── performance.js
    ├── modules/
    │   ├── user-management/
    │   │   ├── controllers/
    │   │   │   └── user.controller.js
    │   │   ├── models/
    │   │   │   └── user.model.js
    │   │   ├── routes/
    │   │   │   └── user.routes.js
    │   │   ├── services/
    │   │   │   └── user.service.js
    │   │   ├── middlewares/
    │   │   │   └── user.middleware.js
    │   │   └── tests/
    │   │       └── user.test.js
    │   ├── project-management/
    │   │   ├── controllers/
    │   │   │   └── project.controller.js
    │   │   ├── models/
    │   │   │   └── project.model.js
    │   │   ├── routes/
    │   │   │   └── project.routes.js
    │   │   ├── services/
    │   │   │   └── project.service.js
    │   │   ├── middlewares/
    │   │   │   └── project.middleware.js
    │   │   └── tests/
    │   │       └── project.test.js
    │   ├── evaluation-system/
    │   │   ├── controllers/
    │   │   │   └── evaluation.controller.js
    │   │   ├── models/
    │   │   │   └── evaluation.model.js
    │   │   ├── routes/
    │   │   │   └── evaluation.routes.js
    │   │   ├── services/
    │   │   │   └── evaluation.service.js
    │   │   ├── middlewares/
    │   │   │   └── evaluation.middleware.js
    │   │   └── tests/
    │   │       └── evaluation.test.js
    │   ├── formation-certification/
    │   │   ├── controllers/
    │   │   │   └── formation.controller.js
    │   │   ├── models/
    │   │   │   ├── formation.model.js
    │   │   │   └── certification.model.js
    │   │   ├── routes/
    │   │   │   └── formation.routes.js
    │   │   ├── services/
    │   │   │   └── certification.service.js
    │   │   ├── middlewares/
    │   │   │   └── formation.middleware.js
    │   │   └── tests/
    │   │       └── formation.test.js
    │   └── forum-management/
    │       ├── controllers/
    │       │   └── forum.controller.js
    │       ├── models/
    │       │   └── forum.model.js
    │       ├── routes/
    │       │   └── forum.routes.js
    │       ├── services/
    │       │   └── forum.service.js
    │       ├── middlewares/
    │       │   └── forum.middleware.js
    │       └── tests/
    │           └── forum.test.js
    ├── services/
    │   ├── email.service.js
    │   └── ia.service.js
    ├── utils/
    │   ├── date.util.js
    │   └── validation.util.js
    └── tests/
        └── integration.test.js

</details>


