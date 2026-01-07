/**
 * =========================================================================
 * CONTRÔLEUR DES AVIS (REVIEWS)
 * =========================================================================
 * 
 * Ce contrôleur gère les opérations CRUD sur les avis des cours.
 * Les utilisateurs peuvent noter et commenter les cours auxquels ils ont accès.
 * 
 * CONTRAINTES:
 * - Un utilisateur ne peut laisser qu'un seul avis par cours
 * - Seul l'auteur de l'avis (ou un admin) peut le modifier/supprimer
 * 
 * RELATION:
 * - 1-to-Many: Course → Reviews (un cours a plusieurs avis)
 * - Many-to-One: Review → User (un avis appartient à un utilisateur)
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Course = require('../models/Course');

// =========================================================================
// CONTRÔLEURS - LECTURE (READ)
// =========================================================================

/**
 * @desc    Récupérer tous les avis d'un cours
 * @route   GET /api/reviews/course/:courseId
 * @access  Public
 * 
 * Retourne la liste des avis triés par date décroissante (plus récents d'abord)
 */
const getReviewsByCourse = asyncHandler(async (req, res) => {
    // Rechercher les avis par l'ID du cours
    const reviews = await Review.find({ course: req.params.courseId })
        .populate('user', 'email')   // Inclure l'email de l'auteur
        .sort({ createdAt: -1 });    // Tri décroissant par date

    res.json(reviews);
});

/**
 * @desc    Récupérer tous les avis d'un utilisateur
 * @route   GET /api/reviews/user/:userId
 * @access  Private
 * 
 * Permet à un utilisateur de voir tous ses avis
 */
const getReviewsByUser = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ user: req.params.userId })
        .populate('course', 'title')  // Inclure le titre du cours
        .sort({ createdAt: -1 });

    res.json(reviews);
});

// =========================================================================
// CONTRÔLEURS - CRÉATION (CREATE)
// =========================================================================

/**
 * @desc    Créer un nouvel avis
 * @route   POST /api/reviews
 * @access  Private (utilisateur connecté)
 * 
 * Cette fonction:
 * 1. Vérifie que le cours existe
 * 2. Vérifie que l'utilisateur n'a pas déjà laissé un avis
 * 3. Crée l'avis avec la note et le commentaire
 */
const createReview = asyncHandler(async (req, res) => {
    // Extraire les données de la requête
    const { rating, comment, courseId } = req.body;

    // Vérifier que le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Cours non trouvé');
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce cours
    // Un utilisateur ne peut avoir qu'un seul avis par cours
    const existingReview = await Review.findOne({
        user: req.user._id,
        course: courseId,
    });

    if (existingReview) {
        res.status(400);  // Bad Request
        throw new Error('Vous avez déjà laissé un avis pour ce cours');
    }

    // Créer l'avis
    const review = await Review.create({
        rating,
        comment,
        user: req.user._id,   // L'utilisateur connecté
        course: courseId,
    });

    // Retourner l'avis créé avec l'auteur populé
    const populatedReview = await Review.findById(review._id).populate(
        'user',
        'email'
    );

    res.status(201).json(populatedReview);  // 201 Created
});

// =========================================================================
// CONTRÔLEURS - MODIFICATION (UPDATE)
// =========================================================================

/**
 * @desc    Mettre à jour un avis
 * @route   PUT /api/reviews/:id
 * @access  Private (auteur de l'avis ou admin)
 * 
 * Permet de modifier la note et/ou le commentaire d'un avis existant
 */
const updateReview = asyncHandler(async (req, res) => {
    // Rechercher l'avis à modifier
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Avis non trouvé');
    }

    // VÉRIFICATION D'AUTORISATION
    // Seul l'auteur de l'avis ou un admin peut le modifier
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);  // Forbidden
        throw new Error('Non autorisé à modifier cet avis');
    }

    // Extraire les nouvelles données
    const { rating, comment } = req.body;

    // Mettre à jour uniquement les champs fournis
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    // Sauvegarder les modifications
    const updatedReview = await review.save();

    // Retourner l'avis mis à jour
    const populatedReview = await Review.findById(updatedReview._id).populate(
        'user',
        'email'
    );

    res.json(populatedReview);
});

// =========================================================================
// CONTRÔLEURS - SUPPRESSION (DELETE)
// =========================================================================

/**
 * @desc    Supprimer un avis
 * @route   DELETE /api/reviews/:id
 * @access  Private (auteur de l'avis ou admin)
 */
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Avis non trouvé');
    }

    // Vérifier l'autorisation
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Non autorisé à supprimer cet avis');
    }

    // Supprimer l'avis
    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Avis supprimé avec succès', id: req.params.id });
});

// =========================================================================
// EXPORT DES FONCTIONS
// =========================================================================

module.exports = {
    getReviewsByCourse,  // GET /api/reviews/course/:courseId
    createReview,        // POST /api/reviews
    updateReview,        // PUT /api/reviews/:id
    deleteReview,        // DELETE /api/reviews/:id
    getReviewsByUser,    // GET /api/reviews/user/:userId
};
