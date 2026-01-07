/**
 * =========================================================================
 * ROUTES DES CATÉGORIES
 * =========================================================================
 * 
 * Ce fichier définit les routes pour la gestion des catégories de cours.
 * 
 * ROUTES PUBLIQUES:
 * - GET /api/categories - Liste de toutes les catégories
 * - GET /api/categories/:id - Détails d'une catégorie
 * 
 * ROUTES PROTÉGÉES (Admin uniquement):
 * - POST /api/categories - Créer une nouvelle catégorie
 * - PUT /api/categories/:id - Modifier une catégorie
 * - DELETE /api/categories/:id - Supprimer une catégorie
 * 
 * Seuls les administrateurs peuvent gérer les catégories.
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

const express = require('express');
const router = express.Router();

// Importer les fonctions du contrôleur des catégories
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');

// Importer les middlewares de sécurité
const { protect, authorize } = require('../middleware/authMiddleware');

// =========================================================================
// ROUTES PUBLIQUES
// =========================================================================

/**
 * GET /api/categories
 * Récupère la liste de toutes les catégories
 * Inclut les cours associés à chaque catégorie
 */
router.get('/', getAllCategories);

/**
 * GET /api/categories/:id
 * Récupère les détails d'une catégorie spécifique
 * Inclut la liste complète des cours de cette catégorie
 */
router.get('/:id', getCategoryById);

// =========================================================================
// ROUTES PROTÉGÉES (ADMIN UNIQUEMENT)
// =========================================================================

/**
 * POST /api/categories
 * Crée une nouvelle catégorie
 * 
 * Middlewares:
 * 1. protect: Vérifie l'authentification
 * 2. authorize('admin'): Vérifie que l'utilisateur est admin
 * 
 * Corps de la requête: { name, description? }
 */
router.post('/', protect, authorize('admin'), createCategory);

/**
 * PUT /api/categories/:id
 * Modifie une catégorie existante
 * 
 * Corps de la requête: { name?, description? }
 */
router.put('/:id', protect, authorize('admin'), updateCategory);

/**
 * DELETE /api/categories/:id
 * Supprime une catégorie
 * 
 * Note: Les cours associés à cette catégorie garderont
 * une référence invalide. Une amélioration serait de nettoyer
 * ces références lors de la suppression.
 */
router.delete('/:id', protect, authorize('admin'), deleteCategory);

// =========================================================================
// EXPORT DU ROUTEUR
// =========================================================================

module.exports = router;
