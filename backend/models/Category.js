/**
 * =========================================================================
 * MODÈLE CATEGORY (CATÉGORIE)
 * =========================================================================
 * 
 * Ce modèle représente les catégories de cours (ex: Développement Web, Data Science).
 * 
 * RELATION Many-to-Many avec Course:
 * - Une catégorie peut contenir plusieurs cours
 * - Un cours peut appartenir à plusieurs catégories
 * - La relation est bidirectionnelle (stockée des deux côtés)
 * 
 * Exemples de catégories:
 * - Développement Web
 * - Data Science
 * - Design UX/UI
 * - Marketing Digital
 * 
 * @author Chaima Massaoudi
 */

// Importation de Mongoose
const mongoose = require('mongoose');

// =========================================================================
// DÉFINITION DU SCHÉMA CATEGORY
// =========================================================================

/**
 * Schéma Mongoose pour les catégories
 * Permet de classer et organiser les cours par thématique
 */
const categorySchema = new mongoose.Schema({
    /**
     * Nom de la catégorie
     * - Obligatoire pour la création
     * - Doit être unique (pas de doublons)
     * - Maximum 50 caractères
     * - Espaces supprimés aux extrémités
     */
    name: {
        type: String,
        required: [true, 'Le nom de la catégorie est requis'],
        unique: true,  // Index unique dans MongoDB
        trim: true,
        maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },

    /**
     * Description de la catégorie
     * - Optionnelle, vide par défaut
     * - Maximum 200 caractères
     * - Explique le contenu de la catégorie
     */
    description: {
        type: String,
        maxlength: [200, 'La description ne peut pas dépasser 200 caractères'],
        default: ''
    },

    /**
     * RELATION Many-to-Many avec Course
     * Liste des cours appartenant à cette catégorie
     * 
     * Note: La relation est bidirectionnelle
     * - Category.courses contient les références vers les cours
     * - Course.categories contient les références vers les catégories
     * 
     * Cette duplication facilite les requêtes dans les deux sens
     * mais nécessite une synchronisation lors des mises à jour
     */
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, {
    /**
     * Options du schéma
     * timestamps: true ajoute automatiquement:
     * - createdAt: Date de création de la catégorie
     * - updatedAt: Date de dernière modification
     */
    timestamps: true
});

// =========================================================================
// EXPORT DU MODÈLE
// =========================================================================

// Créer et exporter le modèle Category
// Crée une collection 'categories' dans MongoDB
module.exports = mongoose.model('Category', categorySchema);
