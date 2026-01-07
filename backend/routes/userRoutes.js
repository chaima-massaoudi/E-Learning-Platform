/**
 * =========================================================================
 * ROUTES DES UTILISATEURS
 * =========================================================================
 * 
 * Ce fichier définit les routes pour la gestion des utilisateurs.
 * 
 * TOUTES LES ROUTES SONT PROTÉGÉES (token JWT requis)
 * 
 * ROUTES:
 * - GET /api/users - Liste tous les utilisateurs (Admin uniquement)
 * - GET /api/users/:id - Récupère un utilisateur par son ID
 * - PUT /api/users/:id - Modifie un utilisateur (propriétaire ou admin)
 * - DELETE /api/users/:id - Supprime un utilisateur (Admin uniquement)
 * 
 * Note: L'inscription se fait via /api/auth/register (authRoutes)
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

const express = require('express');
const router = express.Router();

// Importer les fonctions du contrôleur des utilisateurs
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/userController');

// Importer les middlewares de sécurité
const { protect, authorize } = require('../middleware/authMiddleware');

// =========================================================================
// APPLICATION DU MIDDLEWARE DE PROTECTION À TOUTES LES ROUTES
// =========================================================================

/**
 * router.use(protect)
 * 
 * Toutes les routes de gestion des utilisateurs nécessitent
 * une authentification. Le middleware protect vérifie le token JWT.
 */
router.use(protect);

// =========================================================================
// DÉFINITION DES ROUTES
// =========================================================================

/**
 * GET /api/users
 * Récupère la liste de tous les utilisateurs
 * 
 * Réservé aux administrateurs
 * Retourne les utilisateurs SANS les mots de passe
 */
router.get('/', authorize('admin'), getAllUsers);

/**
 * GET /api/users/:id
 * Récupère les détails d'un utilisateur spécifique
 * 
 * Accessible par tout utilisateur connecté
 * Inclut le profil et les cours inscrits
 */
router.get('/:id', getUserById);

/**
 * PUT /api/users/:id
 * Modifie les informations d'un utilisateur
 * 
 * Le contrôleur vérifie que l'utilisateur modifie son propre compte
 * ou qu'il est administrateur
 * 
 * Corps de la requête: { email?, role? }
 * Note: Le rôle ne peut être modifié que par un admin
 */
router.put('/:id', updateUser);

/**
 * DELETE /api/users/:id
 * Supprime définitivement un utilisateur
 * 
 * Réservé aux administrateurs
 * Note: Devrait également supprimer le profil associé
 */
router.delete('/:id', authorize('admin'), deleteUser);

// =========================================================================
// EXPORT DU ROUTEUR
// =========================================================================

module.exports = router;
