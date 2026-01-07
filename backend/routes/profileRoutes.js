/**
 * =========================================================================
 * ROUTES DES PROFILS
 * =========================================================================
 * 
 * Ce fichier définit les routes pour la gestion des profils utilisateurs.
 * 
 * TOUTES LES ROUTES SONT PROTÉGÉES (token JWT requis)
 * 
 * ROUTES:
 * - GET /api/profiles - Liste tous les profils (Admin uniquement)
 * - GET /api/profiles/:userId - Récupère le profil d'un utilisateur
 * - PUT /api/profiles/:userId - Modifie un profil (propriétaire ou admin)
 * 
 * Note: La création du profil se fait automatiquement lors de l'inscription
 * dans authController.register()
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

const express = require('express');
const router = express.Router();

// Importer les fonctions du contrôleur des profils
const {
    getProfile,
    updateProfile,
    getAllProfiles,
} = require('../controllers/profileController');

// Importer les middlewares de sécurité
const { protect, authorize } = require('../middleware/authMiddleware');

// =========================================================================
// APPLICATION DU MIDDLEWARE DE PROTECTION À TOUTES LES ROUTES
// =========================================================================

/**
 * router.use(protect)
 * 
 * Ce middleware s'applique à TOUTES les routes définies après
 * Chaque requête doit contenir un token JWT valide
 */
router.use(protect);

// =========================================================================
// DÉFINITION DES ROUTES
// =========================================================================

/**
 * GET /api/profiles
 * Récupère la liste de tous les profils
 * 
 * Réservé aux administrateurs pour la gestion des utilisateurs
 */
router.get('/', authorize('admin'), getAllProfiles);

/**
 * GET /api/profiles/:userId
 * Récupère le profil d'un utilisateur spécifique
 * 
 * Note: Le paramètre est :userId (ID de l'utilisateur)
 * et non :id (ID du profil)
 */
router.get('/:userId', getProfile);

/**
 * PUT /api/profiles/:userId
 * Modifie le profil d'un utilisateur
 * 
 * Le contrôleur vérifie que l'utilisateur modifie son propre profil
 * ou qu'il est administrateur
 * 
 * Corps de la requête: { firstName?, lastName?, bio?, avatar?, phone?, address? }
 */
router.put('/:userId', updateProfile);

// =========================================================================
// EXPORT DU ROUTEUR
// =========================================================================

module.exports = router;
