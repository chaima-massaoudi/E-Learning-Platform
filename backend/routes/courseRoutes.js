/**
 * =========================================================================
 * ROUTES DES COURS
 * =========================================================================
 * 
 * Ce fichier définit les routes pour la gestion des cours.
 * 
 * ROUTES PUBLIQUES:
 * - GET /api/courses - Liste de tous les cours publiés
 * - GET /api/courses/:id - Détails d'un cours spécifique
 * - GET /api/courses/instructor/:instructorId - Cours d'un instructeur
 * 
 * ROUTES PROTÉGÉES (Instructor/Admin):
 * - POST /api/courses - Créer un nouveau cours
 * - PUT /api/courses/:id - Modifier un cours
 * - DELETE /api/courses/:id - Supprimer un cours
 * 
 * ROUTES D'INSCRIPTION (Utilisateur connecté):
 * - POST /api/courses/:id/enroll - S'inscrire à un cours
 * - DELETE /api/courses/:id/enroll - Se désinscrire d'un cours
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

const express = require('express');
const router = express.Router();

// Importer toutes les fonctions du contrôleur des cours
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    getCoursesByInstructor,
} = require('../controllers/courseController');

// Importer les middlewares de sécurité
const { protect, authorize } = require('../middleware/authMiddleware');

// =========================================================================
// ROUTES PUBLIQUES
// =========================================================================

/**
 * GET /api/courses
 * Récupère la liste de tous les cours publiés
 * Accessible par tout le monde (pas de token requis)
 */
router.get('/', getAllCourses);

/**
 * GET /api/courses/:id
 * Récupère les détails d'un cours spécifique par son ID
 * :id est un paramètre de route (ex: /api/courses/507f1f77bcf86cd799439011)
 */
router.get('/:id', getCourseById);

/**
 * GET /api/courses/instructor/:instructorId
 * Récupère tous les cours créés par un instructeur spécifique
 */
router.get('/instructor/:instructorId', getCoursesByInstructor);

// =========================================================================
// ROUTES PROTÉGÉES (INSTRUCTEUR/ADMIN)
// =========================================================================

/**
 * POST /api/courses
 * Crée un nouveau cours
 * 
 * Middlewares appliqués:
 * 1. protect: Vérifie le token JWT
 * 2. authorize('instructor', 'admin'): Vérifie le rôle
 * 
 * Seuls les instructeurs et admins peuvent créer des cours
 */
router.post('/', protect, authorize('instructor', 'admin'), createCourse);

/**
 * PUT /api/courses/:id
 * Modifie un cours existant
 * 
 * Le contrôleur vérifie en plus que l'utilisateur est le créateur du cours
 * ou un administrateur
 */
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);

/**
 * DELETE /api/courses/:id
 * Supprime un cours
 * 
 * Le contrôleur vérifie que l'utilisateur est le créateur ou admin
 */
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

// =========================================================================
// ROUTES D'INSCRIPTION
// =========================================================================

/**
 * POST /api/courses/:id/enroll
 * Inscrit l'utilisateur connecté au cours spécifié
 * 
 * Middleware: protect (tout utilisateur connecté peut s'inscrire)
 */
router.post('/:id/enroll', protect, enrollInCourse);

/**
 * DELETE /api/courses/:id/enroll
 * Désinscrit l'utilisateur connecté du cours spécifié
 */
router.delete('/:id/enroll', protect, unenrollFromCourse);

// =========================================================================
// EXPORT DU ROUTEUR
// =========================================================================

module.exports = router;
