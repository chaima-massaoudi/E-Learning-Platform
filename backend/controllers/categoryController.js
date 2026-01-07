/**
 * =========================================================================
 * CONTRÔLEUR DES CATÉGORIES
 * =========================================================================
 * 
 * Ce contrôleur gère les opérations CRUD sur les catégories de cours.
 * Les catégories permettent de classer les cours par thématique.
 * 
 * ACCÈS:
 * - Lecture: Public (tout le monde peut voir les catégories)
 * - Création/Modification/Suppression: Admin uniquement
 * 
 * RELATION Many-to-Many avec Course:
 * - Une catégorie contient plusieurs cours
 * - Un cours peut appartenir à plusieurs catégories
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// =========================================================================
// CONTRÔLEURS - LECTURE (READ)
// =========================================================================

/**
 * @desc    Récupérer toutes les catégories
 * @route   GET /api/categories
 * @access  Public
 * 
 * Retourne la liste de toutes les catégories avec leurs cours associés
 */
const getAllCategories = asyncHandler(async (req, res) => {
    // Rechercher toutes les catégories et inclure les titres des cours
    const categories = await Category.find().populate('courses', 'title');

    res.json(categories);
});

/**
 * @desc    Récupérer une catégorie par son ID
 * @route   GET /api/categories/:id
 * @access  Public
 * 
 * Retourne les détails d'une catégorie avec ses cours complets
 */
const getCategoryById = asyncHandler(async (req, res) => {
    // Rechercher la catégorie par son ID
    const category = await Category.findById(req.params.id).populate(
        'courses',
        'title description price level instructor'  // Champs des cours à inclure
    );

    // Vérifier si la catégorie existe
    if (!category) {
        res.status(404);
        throw new Error('Catégorie non trouvée');
    }

    res.json(category);
});

// =========================================================================
// CONTRÔLEURS - CRÉATION (CREATE)
// =========================================================================

/**
 * @desc    Créer une nouvelle catégorie
 * @route   POST /api/categories
 * @access  Private/Admin (administrateur uniquement)
 * 
 * Cette fonction:
 * 1. Vérifie que le nom de la catégorie n'existe pas déjà
 * 2. Crée la catégorie avec le nom et la description
 */
const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Vérifier si une catégorie avec ce nom existe déjà
    // Le nom doit être unique pour éviter les confusions
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        res.status(400);
        throw new Error('Cette catégorie existe déjà');
    }

    // Créer la nouvelle catégorie
    const category = await Category.create({
        name,
        description,
    });

    res.status(201).json(category);  // 201 Created
});

// =========================================================================
// CONTRÔLEURS - MODIFICATION (UPDATE)
// =========================================================================

/**
 * @desc    Mettre à jour une catégorie
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 * 
 * Permet de modifier le nom et/ou la description d'une catégorie
 */
const updateCategory = asyncHandler(async (req, res) => {
    // Rechercher la catégorie à modifier
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Catégorie non trouvée');
    }

    // Extraire les nouvelles données
    const { name, description } = req.body;

    // Mettre à jour uniquement les champs fournis
    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    // Sauvegarder les modifications
    const updatedCategory = await category.save();

    res.json(updatedCategory);
});

// =========================================================================
// CONTRÔLEURS - SUPPRESSION (DELETE)
// =========================================================================

/**
 * @desc    Supprimer une catégorie
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 * 
 * Note: Cette fonction ne nettoie pas les références dans les cours
 * Les cours garderont une référence vers une catégorie supprimée
 * Dans un cas réel, on devrait aussi nettoyer ces références
 */
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Catégorie non trouvée');
    }

    // Supprimer la catégorie
    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: 'Catégorie supprimée avec succès', id: req.params.id });
});

// =========================================================================
// EXPORT DES FONCTIONS
// =========================================================================

module.exports = {
    getAllCategories,   // GET /api/categories
    getCategoryById,    // GET /api/categories/:id
    createCategory,     // POST /api/categories
    updateCategory,     // PUT /api/categories/:id
    deleteCategory,     // DELETE /api/categories/:id
};
