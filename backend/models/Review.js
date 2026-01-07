/**
 * =========================================================================
 * MODÈLE REVIEW (AVIS/CRITIQUE)
 * =========================================================================
 * 
 * Ce modèle permet aux utilisateurs de laisser des avis sur les cours.
 * 
 * RELATIONS:
 * - Many-to-One avec User: Plusieurs avis peuvent appartenir à un utilisateur
 * - Many-to-One avec Course: Plusieurs avis peuvent appartenir à un cours
 * 
 * CONTRAINTE UNIQUE:
 * Un utilisateur ne peut laisser qu'un seul avis par cours
 * (index composé unique sur {course, user})
 * 
 * @author Chaima Massaoudi
 */

// Importation de Mongoose
const mongoose = require('mongoose');

// =========================================================================
// DÉFINITION DU SCHÉMA REVIEW
// =========================================================================

/**
 * Schéma Mongoose pour les avis
 * Permet aux étudiants de noter et commenter les cours
 */
const reviewSchema = new mongoose.Schema({
    /**
     * Note du cours (1 à 5 étoiles)
     * - Obligatoire pour créer un avis
     * - Minimum: 1 étoile
     * - Maximum: 5 étoiles
     */
    rating: {
        type: Number,
        required: [true, 'La note est requise'],
        min: [1, 'La note minimum est 1'],
        max: [5, 'La note maximum est 5']
    },

    /**
     * Commentaire textuel de l'avis
     * - Obligatoire pour créer un avis
     * - Maximum 1000 caractères
     * - Permet à l'étudiant d'expliquer sa note
     */
    comment: {
        type: String,
        required: [true, 'Le commentaire est requis'],
        maxlength: [1000, 'Le commentaire ne peut pas dépasser 1000 caractères']
    },

    /**
     * RELATION Many-to-One avec User
     * Référence vers l'utilisateur auteur de l'avis
     * - Obligatoire: un avis doit avoir un auteur
     * - Plusieurs avis peuvent appartenir au même utilisateur
     */
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    /**
     * RELATION Many-to-One avec Course
     * Référence vers le cours concerné par l'avis
     * - Obligatoire: un avis doit concerner un cours
     * - Plusieurs avis peuvent concerner le même cours
     */
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
}, {
    /**
     * Options du schéma
     * timestamps: true ajoute automatiquement:
     * - createdAt: Date de création de l'avis
     * - updatedAt: Date de dernière modification
     */
    timestamps: true
});

// =========================================================================
// INDEX COMPOSÉ UNIQUE
// =========================================================================

/**
 * Index composé unique sur {course, user}
 * 
 * Cette contrainte garantit qu'un utilisateur ne peut laisser
 * qu'un seul avis par cours. Si un utilisateur tente de créer
 * un second avis pour le même cours, MongoDB renverra une erreur.
 * 
 * L'ordre des champs dans l'index (course: 1, user: 1) optimise
 * les requêtes qui filtrent d'abord par cours, puis par utilisateur.
 */
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// =========================================================================
// EXPORT DU MODÈLE
// =========================================================================

// Créer et exporter le modèle Review
// Crée une collection 'reviews' dans MongoDB
module.exports = mongoose.model('Review', reviewSchema);
