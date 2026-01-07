/**
 * =========================================================================
 * MODÈLE PROFILE (PROFIL UTILISATEUR)
 * =========================================================================
 * 
 * Ce modèle stocke les informations personnelles détaillées des utilisateurs.
 * 
 * RELATION 1-to-1 avec User:
 * - Chaque Profile appartient à exactement un User
 * - Chaque User a exactement un Profile
 * - La contrainte unique sur 'user' garantit cette relation
 * 
 * Avantages de séparer User et Profile:
 * - Données d'authentification (User) séparées des données personnelles (Profile)
 * - Meilleure organisation et maintenabilité
 * - Possibilité de charger uniquement les données nécessaires
 * 
 * @author Chaima Massaoudi
 */

// Importation de Mongoose
const mongoose = require('mongoose');

// =========================================================================
// DÉFINITION DU SCHÉMA PROFILE
// =========================================================================

/**
 * Schéma Mongoose pour les profils utilisateurs
 * Contient les informations personnelles non sensibles
 */
const profileSchema = new mongoose.Schema({
    /**
     * RELATION 1-to-1 avec User
     * Référence vers le document User propriétaire de ce profil
     * - required: Le profil doit obligatoirement être lié à un utilisateur
     * - unique: Un utilisateur ne peut avoir qu'un seul profil
     */
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',      // Référence au modèle User
        required: true,   // Obligatoire
        unique: true      // Garantit la relation 1-to-1
    },

    /**
     * Prénom de l'utilisateur
     * - Obligatoire lors de l'inscription
     * - Maximum 50 caractères
     * - Espaces supprimés aux extrémités
     */
    firstName: {
        type: String,
        required: [true, 'Le prénom est requis'],
        trim: true,
        maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
    },

    /**
     * Nom de famille de l'utilisateur
     * - Obligatoire lors de l'inscription
     * - Maximum 50 caractères
     * - Espaces supprimés aux extrémités
     */
    lastName: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
        maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },

    /**
     * Biographie de l'utilisateur
     * - Optionnelle, vide par défaut
     * - Maximum 500 caractères
     * - Permet de se présenter aux autres utilisateurs
     */
    bio: {
        type: String,
        maxlength: [500, 'La bio ne peut pas dépasser 500 caractères'],
        default: ''
    },

    /**
     * URL de l'avatar (photo de profil)
     * - Optionnelle, vide par défaut
     * - Stocke l'URL vers l'image (pas l'image elle-même)
     */
    avatar: {
        type: String,
        default: ''
    },

    /**
     * Numéro de téléphone
     * - Optionnel, vide par défaut
     */
    phone: {
        type: String,
        default: ''
    },

    /**
     * Adresse postale
     * - Optionnelle, vide par défaut
     */
    address: {
        type: String,
        default: ''
    }
}, {
    /**
     * Options du schéma
     * timestamps: true ajoute automatiquement:
     * - createdAt: Date de création du profil
     * - updatedAt: Date de dernière modification
     */
    timestamps: true
});

// =========================================================================
// EXPORT DU MODÈLE
// =========================================================================

// Créer et exporter le modèle Profile
// Crée une collection 'profiles' dans MongoDB
module.exports = mongoose.model('Profile', profileSchema);
