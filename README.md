# E-Learning Platform - Projet MERN

Application web complète de plateforme de cours en ligne développée avec le stack MERN (MongoDB, Express.js, React, Node.js).

## 📋 Fonctionnalités

### Backend
- ✅ 5 Entités avec relations variées (User, Profile, Course, Review, Category)
- ✅ Authentification JWT complète (register, login, logout)
- ✅ Hashage des mots de passe avec bcrypt
- ✅ API REST avec CRUD complet pour chaque entité
- ✅ Middleware de protection des routes
- ✅ Gestion des erreurs centralisée
- ✅ Validation des données avec Mongoose

### Frontend
- ✅ React 18 avec Vite
- ✅ React Router v6 pour la navigation
- ✅ Context API pour la gestion de l'état d'authentification
- ✅ Routes protégées
- ✅ Design moderne et responsive

## 🗄️ Modèle de Données

| Relation | Description |
|----------|-------------|
| 1-to-1 | User ↔ Profile |
| 1-to-Many | User → Course (instructeur) |
| 1-to-Many | Course → Review |
| Many-to-Many | User ↔ Course (inscriptions) |
| Many-to-Many | Course ↔ Category |

## 🚀 Installation

### Prérequis
- Node.js (v18+)
- MongoDB (local ou Atlas)

### Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` à partir de `.env.example` :
```
MONGO_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=30d
PORT=5000
```

Démarrer le serveur :
```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/auth/me | Profil utilisateur |

### Courses
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/courses | Liste des cours |
| GET | /api/courses/:id | Détails d'un cours |
| POST | /api/courses | Créer un cours |
| PUT | /api/courses/:id | Modifier un cours |
| DELETE | /api/courses/:id | Supprimer un cours |
| POST | /api/courses/:id/enroll | S'inscrire |
| DELETE | /api/courses/:id/enroll | Se désinscrire |

### Reviews
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/reviews/course/:id | Avis d'un cours |
| POST | /api/reviews | Créer un avis |
| PUT | /api/reviews/:id | Modifier un avis |
| DELETE | /api/reviews/:id | Supprimer un avis |

### Categories
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/categories | Liste des catégories |
| POST | /api/categories | Créer (admin) |

## 🛡️ Sécurité

- Authentification JWT
- Hashage bcrypt des mots de passe
- Variables d'environnement pour les secrets
- Validation des données entrantes
- Protection CORS

## 📁 Structure du Projet

```
projet-mern/
├── backend/
│   ├── config/         # Configuration DB
│   ├── controllers/    # Logique métier
│   ├── middleware/     # Auth, erreurs
│   ├── models/         # Schémas Mongoose
│   ├── routes/         # Routes API
│   └── server.js       # Point d'entrée
├── frontend/
│   ├── src/
│   │   ├── components/ # Composants réutilisables
│   │   ├── context/    # Contexte Auth
│   │   ├── pages/      # Pages de l'application
│   │   └── services/   # API calls
│   └── package.json
└── README.md
```

## 👨‍💻 Auteur
Chaima Massaoudi

## 📄 Licence

ISC
