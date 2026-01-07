/**
 * =========================================================================
 * MODÈLE COURSE (COURS)
 * =========================================================================
 * 
 * Ce modèle représente les cours disponibles sur la plateforme e-learning.
 * 
 * RELATIONS:
 * - 1-to-Many avec User (instructor): Un instructeur crée plusieurs cours
 * - Many-to-Many avec User (enrolledStudents): Un cours a plusieurs étudiants
 * - Many-to-Many avec Category: Un cours peut appartenir à plusieurs catégories
 * - 1-to-Many avec Review (virtual): Un cours a plusieurs avis
 * 
 * FONCTIONNALITÉS:
 * - Virtual 'reviews' pour récupérer les avis sans stockage
 * - Virtual 'averageRating' pour calculer la note moyenne
 * - Support pour brouillons (isPublished: false)
 * 
 * @author Chaima Massaoudi
 */

// Importation de Mongoose
const mongoose = require('mongoose');

// =========================================================================
// DÉFINITION DU SCHÉMA COURSE
// =========================================================================

/**
 * Schéma Mongoose pour les cours
 * Contient toutes les informations d'un cours de la plateforme
 */
const courseSchema = new mongoose.Schema({
    /**
     * Titre du cours
     * - Obligatoire pour la création
     * - Maximum 100 caractères
     * - Affiché dans les listes et les recherches
     */
    title: {
        type: String,
        required: [true, 'Le titre du cours est requis'],
        trim: true,
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },

    /**
     * Description détaillée du cours
     * - Obligatoire pour la création
     * - Maximum 2000 caractères
     * - Explique le contenu et les objectifs du cours
     */
    description: {
        type: String,
        required: [true, 'La description est requise'],
        maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
    },

    /**
     * Prix du cours en euros
     * - Obligatoire pour la création
     * - Ne peut pas être négatif
     * - 0 = cours gratuit
     */
    price: {
        type: Number,
        required: [true, 'Le prix est requis'],
        min: [0, 'Le prix ne peut pas être négatif']
    },

    /**
     * URL de l'image de couverture du cours
     * - Optionnelle, vide par défaut
     * - Affichée dans les cartes de cours
     */
    image: {
        type: String,
        default: ''
    },

    /**
     * Niveau de difficulté du cours
     * - Trois niveaux possibles: débutant, intermédiaire, avancé
     * - Par défaut: débutant
     */
    level: {
        type: String,
        enum: ['débutant', 'intermédiaire', 'avancé'],  // Valeurs autorisées
        default: 'débutant'
    },

    /**
     * Durée totale du cours en heures
     * - Optionnelle, 0 par défaut
     * - Aide les étudiants à planifier leur apprentissage
     */
    duration: {
        type: Number,
        default: 0
    },

    /**
     * RELATION 1-to-Many avec User (instructeur)
     * Référence vers l'utilisateur qui a créé ce cours
     * - Obligatoire: chaque cours doit avoir un créateur
     * - Un instructeur peut créer plusieurs cours
     */
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    /**
     * RELATION Many-to-Many avec Category
     * Liste des catégories auxquelles appartient ce cours
     * Permet de classer et filtrer les cours
     */
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],

    /**
     * RELATION Many-to-Many avec User (étudiants inscrits)
     * Liste des utilisateurs inscrits à ce cours
     * Un cours peut avoir plusieurs étudiants
     */
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    /**
     * Statut de publication du cours
     * - false: Brouillon (visible uniquement par l'instructeur)
     * - true: Publié (visible par tous)
     */
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    /**
     * Options du schéma
     * - timestamps: Ajoute createdAt et updatedAt
     * - toJSON/toObject { virtuals: true }: Inclut les champs virtuels dans les réponses
     */
    timestamps: true,
    toJSON: { virtuals: true },    // Inclure les virtuals lors de la conversion en JSON
    toObject: { virtuals: true }   // Inclure les virtuals lors de la conversion en objet
});

// =========================================================================
// CHAMPS VIRTUELS
// =========================================================================

/**
 * Virtual 'reviews' - RELATION 1-to-Many avec Review
 * 
 * Ce champ virtuel permet de récupérer tous les avis d'un cours
 * sans stocker les références dans le document Course.
 * 
 * Les avis sont stockés dans la collection Review avec une référence vers Course.
 * Cette approche évite la duplication des données.
 */
courseSchema.virtual('reviews', {
    ref: 'Review',           // Modèle référencé
    localField: '_id',        // Champ local à comparer
    foreignField: 'course'    // Champ dans Review qui référence Course
});

/**
 * Virtual 'averageRating' - Calcul de la note moyenne
 * 
 * Ce getter calcule dynamiquement la note moyenne du cours
 * basée sur tous les avis (reviews).
 * 
 * @returns {number} Note moyenne du cours (0 si pas d'avis)
 */
courseSchema.virtual('averageRating').get(function () {
    // Vérifier si le cours a des avis
    if (this.reviews && this.reviews.length > 0) {
        // Calculer la somme de toutes les notes
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        // Calculer la moyenne et arrondir à 1 décimale
        return (sum / this.reviews.length).toFixed(1);
    }
    // Retourner 0 si pas d'avis
    return 0;
});

// =========================================================================
// EXPORT DU MODÈLE
// =========================================================================

// Créer et exporter le modèle Course
// Crée une collection 'courses' dans MongoDB
module.exports = mongoose.model('Course', courseSchema);
