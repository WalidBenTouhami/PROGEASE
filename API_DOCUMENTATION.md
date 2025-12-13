# API Documentation - PROGEASE

## Table des Matières
- [API Intelligence Artificielle](#api-intelligence-artificielle)
- [API Planification et Rappels](#api-planification-et-rappels)
- [Authentification](#authentification)
- [Format des Réponses](#format-des-réponses)
- [Codes d'Erreur](#codes-derreur)

## Base URL
```
http://localhost:3000/api
```

## Authentification

Toutes les requêtes nécessitent un token JWT dans le header:
```
Authorization: Bearer <votre_token>
```

---

## API Intelligence Artificielle

### 1. Formation d'Équipes

**POST** `/api/ai/form-teams`

Forme des équipes optimisées basées sur les compétences et les préférences.

**Body:**
```json
{
  "membres": [
    {
      "id": "user1",
      "nom": "Alice Dupont",
      "competences": ["JavaScript", "React", "Node.js"],
      "niveau": "INTERMEDIAIRE",
      "disponibilite": "TEMPS_PLEIN"
    },
    {
      "id": "user2",
      "nom": "Bob Martin",
      "competences": ["Python", "Django", "PostgreSQL"],
      "niveau": "AVANCE",
      "disponibilite": "TEMPS_PARTIEL"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Équipes formées avec succès",
  "data": {
    "equipes": [
      {
        "id": "equipe1",
        "membres": ["user1", "user3"],
        "competencesPrincipales": ["JavaScript", "React"],
        "forceEstimee": 8.5
      }
    ]
  }
}
```

### 2. Association de Tuteurs

**POST** `/api/ai/match-tutors`

Associe intelligemment les tuteurs aux équipes/projets.

**Body:**
```json
{
  "membres": [
    {
      "id": "tuteur1",
      "role": "TUTEUR",
      "competences": ["JavaScript", "React"],
      "disponibilite": "20h/semaine"
    },
    {
      "id": "equipe1",
      "role": "EQUIPE",
      "competences": ["JavaScript"],
      "besoins": ["Mentorat technique", "Revues de code"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tuteurs associés avec succès",
  "data": {
    "associations": [
      {
        "equipe": "equipe1",
        "tuteur": "tuteur1",
        "raisonAssociation": "Expertise en développement web et React",
        "scoreCompatibilite": 0.85
      }
    ]
  }
}
```

### 3. Ressources d'Apprentissage

**POST** `/api/ai/learning-resources`

Recommande des ressources d'apprentissage personnalisées.

**Body:**
```json
{
  "competences": ["JavaScript", "React", "Node.js"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ressources recommandées avec succès",
  "data": {
    "recommandations": [
      {
        "competence": "JavaScript",
        "ressources": {
          "cours": {
            "titre": "JavaScript Avancé",
            "lien": "https://example.com/js-advanced"
          },
          "livre": {
            "titre": "You Don't Know JS",
            "auteur": "Kyle Simpson"
          },
          "projet": {
            "titre": "Todo App",
            "description": "Application de gestion de tâches"
          },
          "communaute": {
            "nom": "r/javascript",
            "lien": "https://reddit.com/r/javascript"
          }
        }
      }
    ]
  }
}
```

### 4. Suivi de Progression

**POST** `/api/ai/track-progress`

Calcule automatiquement la progression d'un projet.

**Body:**
```json
{
  "taches": [
    {
      "titre": "Conception interface",
      "statut": "TERMINEE"
    },
    {
      "titre": "Développement backend",
      "statut": "EN_COURS"
    },
    {
      "titre": "Tests unitaires",
      "statut": "A_FAIRE"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progression calculée avec succès",
  "data": {
    "totalTaches": 3,
    "tachesTerminees": 1,
    "tachesEnCours": 1,
    "pourcentageProgression": 33
  }
}
```

### 5. Prédiction de Performance

**POST** `/api/ai/predict-performance/:projetId`

Prédit la performance future basée sur l'historique.

**Body:**
```json
{
  "historique": [
    { "date": "2024-01-01", "score": 15 },
    { "date": "2024-01-15", "score": 16 },
    { "date": "2024-02-01", "score": 17 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Performance prédite avec succès",
  "data": {
    "scoreFinalPredit": 18,
    "tendance": "POSITIVE",
    "confidence": 0.85,
    "facteurs": ["Progression constante", "Équipe stable"]
  }
}
```

### 6. Génération de Planning

**POST** `/api/ai/generate-schedule`

Génère un planning intelligent pour les tâches.

**Body:**
```json
{
  "taches": [
    {
      "titre": "Analyse des besoins",
      "duree": 7,
      "dependances": []
    },
    {
      "titre": "Développement",
      "duree": 30,
      "dependances": ["Analyse des besoins"]
    }
  ],
  "dateDebut": "2024-01-01",
  "dateFin": "2024-03-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Planning généré avec succès",
  "data": {
    "planning": [
      {
        "tache": "Analyse des besoins",
        "debut": "2024-01-01",
        "fin": "2024-01-07"
      },
      {
        "tache": "Développement",
        "debut": "2024-01-08",
        "fin": "2024-02-07"
      }
    ]
  }
}
```

---

## API Planification et Rappels

### 1. Génération de Rappels

**GET** `/api/scheduling/reminders/:projetId`

Génère des rappels automatiques pour un projet.

**Response:**
```json
{
  "success": true,
  "message": "Rappels générés avec succès",
  "data": {
    "projet": {
      "id": "507f1f77bcf86cd799439011",
      "titre": "Mon Projet"
    },
    "rappels": [
      {
        "type": "DEADLINE_PROJET",
        "titre": "Échéance proche: Mon Projet",
        "message": "Le projet se termine dans 5 jours",
        "priorite": "HAUTE",
        "dateRappel": "2024-01-26T10:00:00Z",
        "destinataires": ["user1", "user2"]
      }
    ],
    "statistiques": {
      "total": 5,
      "parPriorite": {
        "urgente": 2,
        "haute": 2,
        "moyenne": 1
      }
    }
  }
}
```

### 2. Planification d'Événements

**POST** `/api/scheduling/events/:projetId`

Planifie des événements automatiquement.

**Body:**
```json
{
  "type": "REUNION",
  "frequence": "HEBDOMADAIRE"
}
```

**Options:**
- **type**: REUNION, REVUE, SOUTENANCE
- **frequence**: QUOTIDIEN, HEBDOMADAIRE, BIHEBDOMADAIRE, MENSUEL

**Response:**
```json
{
  "success": true,
  "message": "Événements planifiés avec succès",
  "data": {
    "evenements": [
      {
        "type": "REUNION",
        "titre": "REUNION #1 - Mon Projet",
        "description": "Réunion planifiée automatiquement",
        "date": "2024-01-08T10:00:00Z",
        "duree": 60,
        "participants": ["user1", "user2"],
        "tuteur": "tuteur1",
        "lieu": "À définir",
        "statut": "PLANIFIE"
      }
    ],
    "statistiques": {
      "total": 12,
      "reunions": 10,
      "revues": 1,
      "soutenances": 1
    }
  }
}
```

### 3. Détection de Conflits

**POST** `/api/scheduling/conflicts`

Détecte les conflits de planning.

**Body:**
```json
{
  "evenements": [
    {
      "titre": "Réunion 1",
      "date": "2024-01-01T10:00:00Z",
      "duree": 60,
      "participants": ["user1", "user2"]
    },
    {
      "titre": "Réunion 2",
      "date": "2024-01-01T10:30:00Z",
      "duree": 60,
      "participants": ["user1", "user3"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "1 conflit(s) détecté(s)",
  "data": {
    "conflits": [
      {
        "type": "CHEVAUCHEMENT",
        "evenement1": {
          "titre": "Réunion 1",
          "date": "2024-01-01T10:00:00Z"
        },
        "evenement2": {
          "titre": "Réunion 2",
          "date": "2024-01-01T10:30:00Z"
        },
        "participantsCommuns": ["user1"],
        "gravite": "HAUTE"
      }
    ],
    "statistiques": {
      "total": 1,
      "parGravite": {
        "haute": 1,
        "moyenne": 0
      }
    }
  }
}
```

### 4. Envoi de Notifications

**POST** `/api/scheduling/notifications`

Envoie des notifications pour les rappels.

**Body:**
```json
{
  "rappels": [
    {
      "type": "DEADLINE_PROJET",
      "titre": "Échéance proche",
      "dateRappel": "2024-01-01T10:00:00Z",
      "destinataires": ["user1", "user2"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 notification(s) envoyée(s)",
  "data": {
    "envoyes": 2,
    "notifications": [
      {
        "rappelId": "rappel1",
        "type": "DEADLINE_PROJET",
        "titre": "Échéance proche",
        "destinataires": ["user1", "user2"],
        "dateEnvoi": "2024-01-01T10:00:00Z",
        "statut": "ENVOYE"
      }
    ]
  }
}
```

### 5. Planning Complet

**GET** `/api/scheduling/complete/:projetId`

Génère un planning complet avec rappels, événements et conflits.

**Response:**
```json
{
  "success": true,
  "message": "Planning complet généré avec succès",
  "data": {
    "projet": {
      "id": "507f1f77bcf86cd799439011",
      "titre": "Mon Projet",
      "dateDebut": "2024-01-01",
      "dateFin": "2024-03-31"
    },
    "rappels": [...],
    "evenements": [...],
    "conflits": [...],
    "statistiques": {
      "rappels": { "total": 5, "urgents": 2 },
      "evenements": { "total": 12, "reunions": 10 },
      "conflits": { "total": 1, "graves": 1 }
    }
  }
}
```

---

## Format des Réponses

Toutes les réponses suivent le format standard:

```json
{
  "success": true | false,
  "message": "Description du résultat",
  "data": { /* données spécifiques */ }
}
```

En cas d'erreur:

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": [
    {
      "field": "nom_du_champ",
      "message": "Message d'erreur",
      "value": "valeur_invalide"
    }
  ]
}
```

---

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès interdit |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

---

## Health Checks

### AI Service
**GET** `/api/ai/health`

### Scheduling Service
**GET** `/api/scheduling/health`

**Response:**
```json
{
  "success": true,
  "message": "Service is operational",
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T10:00:00Z"
  }
}
```

---

## Exemples d'Utilisation

### JavaScript (Fetch API)

```javascript
// Formation d'équipes
const response = await fetch('http://localhost:3000/api/ai/form-teams', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    membres: [
      { id: 'user1', nom: 'Alice', competences: ['JavaScript'] }
    ]
  })
});

const data = await response.json();
console.log(data);
```

### Python (Requests)

```python
import requests

url = 'http://localhost:3000/api/scheduling/reminders/PROJECT_ID'
headers = {'Authorization': f'Bearer {token}'}

response = requests.get(url, headers=headers)
data = response.json()
print(data)
```

### cURL

```bash
curl -X POST http://localhost:3000/api/ai/track-progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "taches": [
      {"titre": "Tâche 1", "statut": "TERMINEE"}
    ]
  }'
```

---

## Notes

1. **Rate Limiting**: 100 requêtes par 15 minutes par IP
2. **Timeout**: 30 secondes pour les requêtes IA
3. **Taille maximale**: 10MB pour les requêtes
4. **Mode Test**: L'API utilise un mode test si la clé API IA n'est pas configurée

---

## Support

Pour toute question ou problème, consultez:
- README.md pour la configuration
- Les logs dans `/backend/logs`
- Les tests dans `/backend/tests`
