/**
 * =========================================================================
 * SERVEUR PRINCIPAL - E-Learning Platform API
 * =========================================================================
 * 
 * Ce fichier est le point d'entrée de l'application backend.
 * Il configure et démarre le serveur Express avec tous les middlewares
 * et routes nécessaires.
 * 
 * Technologies utilisées:
 * - Express.js: Framework web pour Node.js
 * - CORS: Middleware pour permettre les requêtes cross-origin
 * - dotenv: Gestion des variables d'environnement
 * - MongoDB/Mongoose: Base de données NoSQL
 * 
 * @author Chaima Massaoudi
 * @version 1.0.0
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// Express - Framework web minimaliste pour Node.js
const express = require('express');

// CORS - Cross-Origin Resource Sharing, permet les requêtes depuis le frontend
const cors = require('cors');

// dotenv - Charge les variables d'environnement depuis le fichier .env
const dotenv = require('dotenv');

// Fonction de connexion à MongoDB
const connectDB = require('./config/db');

// Middlewares de gestion des erreurs personnalisés
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// =========================================================================
// CONFIGURATION DE L'ENVIRONNEMENT
// =========================================================================

// Charger les variables d'environnement depuis le fichier .env
// Ces variables incluent: MONGO_URI, JWT_SECRET, PORT, etc.
dotenv.config();

// =========================================================================
// CONNEXION À LA BASE DE DONNÉES
// =========================================================================

// Établir la connexion à MongoDB via Mongoose
// La connexion est asynchrone et utilise l'URI défini dans .env
connectDB();

// =========================================================================
// INITIALISATION DE L'APPLICATION EXPRESS
// =========================================================================

// Créer une instance de l'application Express
const app = express();

// =========================================================================
// CONFIGURATION DES MIDDLEWARES
// =========================================================================

/**
 * Middleware CORS
 * Permet les requêtes cross-origin depuis le frontend (React sur port 5173)
 * Sans ce middleware, le navigateur bloquerait les requêtes API
 */
app.use(cors());

/**
 * Middleware pour parser le JSON
 * Permet de lire le corps des requêtes au format JSON
 * req.body contiendra les données JSON envoyées par le client
 */
app.use(express.json());

/**
 * Middleware pour parser les données URL-encoded
 * Permet de lire les données de formulaires HTML classiques
 * extended: true permet les objets imbriqués
 */
app.use(express.urlencoded({ extended: true }));

// =========================================================================
// ROUTE DE TEST (RACINE)
// =========================================================================

/**
 * Route GET /
 * Route de bienvenue qui affiche les informations de l'API
 * Utile pour vérifier que le serveur fonctionne correctement
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API E-Learning Platform',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',           // Authentification (login, register)
            users: '/api/users',         // Gestion des utilisateurs
            profiles: '/api/profiles',   // Gestion des profils
            courses: '/api/courses',     // Gestion des cours
            reviews: '/api/reviews',     // Gestion des avis
            categories: '/api/categories', // Gestion des catégories
        },
    });
});

// =========================================================================
// MONTAGE DES ROUTES API
// =========================================================================

/**
 * Routes d'authentification
 * POST /api/auth/register - Inscription
 * POST /api/auth/login - Connexion
 * GET /api/auth/me - Profil utilisateur connecté
 */
app.use('/api/auth', require('./routes/authRoutes'));

/**
 * Routes de gestion des utilisateurs
 * GET /api/users - Liste des utilisateurs (admin)
 * GET /api/users/:id - Détails d'un utilisateur
 * PUT /api/users/:id - Modifier un utilisateur
 * DELETE /api/users/:id - Supprimer un utilisateur (admin)
 */
app.use('/api/users', require('./routes/userRoutes'));

/**
 * Routes de gestion des profils
 * GET /api/profiles - Liste des profils (admin)
 * GET /api/profiles/:userId - Profil d'un utilisateur
 * PUT /api/profiles/:userId - Modifier un profil
 */
app.use('/api/profiles', require('./routes/profileRoutes'));

/**
 * Routes de gestion des cours
 * GET /api/courses - Liste des cours publiés
 * GET /api/courses/:id - Détails d'un cours
 * POST /api/courses - Créer un cours (instructor/admin)
 * PUT /api/courses/:id - Modifier un cours
 * DELETE /api/courses/:id - Supprimer un cours
 * POST /api/courses/:id/enroll - S'inscrire à un cours
 * DELETE /api/courses/:id/enroll - Se désinscrire
 */
app.use('/api/courses', require('./routes/courseRoutes'));

/**
 * Routes de gestion des avis
 * GET /api/reviews/course/:courseId - Avis d'un cours
 * POST /api/reviews - Créer un avis
 * PUT /api/reviews/:id - Modifier un avis
 * DELETE /api/reviews/:id - Supprimer un avis
 */
app.use('/api/reviews', require('./routes/reviewRoutes'));

/**
 * Routes de gestion des catégories
 * GET /api/categories - Liste des catégories
 * GET /api/categories/:id - Détails d'une catégorie
 * POST /api/categories - Créer une catégorie (admin)
 * PUT /api/categories/:id - Modifier une catégorie (admin)
 * DELETE /api/categories/:id - Supprimer une catégorie (admin)
 */
app.use('/api/categories', require('./routes/categoryRoutes'));

// =========================================================================
// MIDDLEWARES DE GESTION DES ERREURS
// =========================================================================

/**
 * Middleware 404 - Route non trouvée
 * Intercepte toutes les requêtes qui n'ont pas trouvé de route correspondante
 * Doit être placé après toutes les routes
 */
app.use(notFound);

/**
 * Middleware global de gestion des erreurs
 * Intercepte toutes les erreurs et renvoie une réponse JSON formatée
 * Doit être le dernier middleware
 */
app.use(errorHandler);

// =========================================================================
// DÉMARRAGE DU SERVEUR
// =========================================================================

// Récupérer le port depuis les variables d'environnement ou utiliser 5000 par défaut
const PORT = process.env.PORT || 5000;

// Démarrer le serveur HTTP et écouter sur le port spécifié
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
});
