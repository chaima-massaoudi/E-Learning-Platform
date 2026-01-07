/**
 * =========================================================================
 * ROUTES DES AVIS (REVIEWS)
 * =========================================================================
 * 
 * Ce fichier définit les routes pour la gestion des avis sur les cours.
 * 
 * ROUTES PUBLIQUES:
 * - GET /api/reviews/course/:courseId - Récupérer les avis d'un cours
 * 
 * ROUTES PROTÉGÉES (Utilisateur connecté):
 * - POST /api/reviews - Créer un nouvel avis
 * - PUT /api/reviews/:id - Modifier un avis (auteur ou admin)
 * - DELETE /api/reviews/:id - Supprimer un avis (auteur ou admin)
 * - GET /api/reviews/user/:userId - Récupérer les avis d'un utilisateur
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

const express = require('express');
const router = express.Router();

// Importer les fonctions du contrôleur des avis
const {
    getReviewsByCourse,
    createReview,
    updateReview,
    deleteReview,
    getReviewsByUser,
} = require('../controllers/reviewController');

// Importer le middleware de protection
const { protect } = require('../middleware/authMiddleware');

// =========================================================================
// ROUTES PUBLIQUES
// =========================================================================

/**
 * GET /api/reviews/course/:courseId
 * Récupère tous les avis d'un cours spécifique
 * Accessible par tout le monde pour consulter les avis avant inscription
 */
router.get('/course/:courseId', getReviewsByCourse);

// =========================================================================
// ROUTES PROTÉGÉES
// =========================================================================

/**
 * POST /api/reviews
 * Crée un nouvel avis sur un cours
 * 
 * Corps de la requête: { rating, comment, courseId }
 * L'utilisateur connecté sera automatiquement l'auteur
 */
router.post('/', protect, createReview);

/**
 * PUT /api/reviews/:id
 * Modifie un avis existant
 * 
 * Le contrôleur vérifie que l'utilisateur est l'auteur de l'avis
 * ou un administrateur
 */
router.put('/:id', protect, updateReview);

/**
 * DELETE /api/reviews/:id
 * Supprime un avis
 * 
 * Le contrôleur vérifie que l'utilisateur est l'auteur ou admin
 */
router.delete('/:id', protect, deleteReview);

/**
 * GET /api/reviews/user/:userId
 * Récupère tous les avis laissés par un utilisateur spécifique
 * 
 * Utile pour afficher l'historique des avis d'un utilisateur
 */
router.get('/user/:userId', protect, getReviewsByUser);

// =========================================================================
// EXPORT DU ROUTEUR
// =========================================================================

module.exports = router;
