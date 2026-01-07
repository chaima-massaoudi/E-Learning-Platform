/**
 * =========================================================================
 * ROUTES D'AUTHENTIFICATION
 * =========================================================================
 * 
 * Ce fichier définit les routes pour l'authentification des utilisateurs.
 * 
 * ROUTES PUBLIQUES (pas de token requis):
 * - POST /api/auth/register - Inscription d'un nouvel utilisateur
 * - POST /api/auth/login - Connexion d'un utilisateur existant
 * 
 * ROUTES PROTÉGÉES (token JWT requis):
 * - GET /api/auth/me - Récupérer le profil de l'utilisateur connecté
 * - POST /api/auth/logout - Déconnexion de l'utilisateur
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// Express - Framework web
const express = require('express');

// Créer un routeur Express pour regrouper les routes
const router = express.Router();

// Importer les fonctions du contrôleur d'authentification
const { register, login, getMe, logout } = require('../controllers/authController');

// Importer le middleware de protection des routes
const { protect } = require('../middleware/authMiddleware');

// =========================================================================
// DÉFINITION DES ROUTES
// =========================================================================

/**
 * Routes publiques - Accessibles sans authentification
 */

// POST /api/auth/register
// Corps de la requête: { email, password, firstName, lastName, role? }
// Réponse: { _id, email, role, profile, token }
router.post('/register', register);

// POST /api/auth/login
// Corps de la requête: { email, password }
// Réponse: { _id, email, role, profile, token }
router.post('/login', login);

/**
 * Routes protégées - Nécessitent un token JWT valide
 * Le middleware 'protect' vérifie le token avant d'exécuter le handler
 */

// GET /api/auth/me
// Header: Authorization: Bearer <token>
// Réponse: Informations complètes de l'utilisateur connecté
router.get('/me', protect, getMe);

// POST /api/auth/logout
// Note: La déconnexion effective se fait côté client (suppression du token)
router.post('/logout', protect, logout);

// =========================================================================
// EXPORT DU ROUTEUR
// =========================================================================

module.exports = router;
