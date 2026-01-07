/**
 * =========================================================================
 * MODÈLE USER (UTILISATEUR)
 * =========================================================================
 * 
 * Ce modèle définit la structure des utilisateurs dans la base de données.
 * 
 * RELATIONS:
 * - 1-to-1 avec Profile: Chaque utilisateur a un profil unique
 * - 1-to-Many avec Course: Un instructeur peut créer plusieurs cours
 * - Many-to-Many avec Course: Un étudiant peut s'inscrire à plusieurs cours
 * 
 * SÉCURITÉ:
 * - Les mots de passe sont hashés avec bcrypt avant la sauvegarde
 * - Méthode de comparaison des mots de passe pour l'authentification
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// Mongoose - ODM pour MongoDB, permet de définir des schémas
const mongoose = require('mongoose');

// bcryptjs - Bibliothèque pour le hashage sécurisé des mots de passe
const bcrypt = require('bcryptjs');

// =========================================================================
// DÉFINITION DU SCHÉMA UTILISATEUR
// =========================================================================

/**
 * Schéma Mongoose pour les utilisateurs
 * Définit la structure et les règles de validation des documents User
 */
const userSchema = new mongoose.Schema({
    /**
     * Adresse email de l'utilisateur
     * - Obligatoire pour l'inscription
     * - Doit être unique (pas de doublons)
     * - Convertie automatiquement en minuscules
     * - Espaces supprimés aux extrémités (trim)
     * - Validée par une expression régulière
     */
    email: {
        type: String,
        required: [true, 'L\'email est requis'],           // Message d'erreur personnalisé
        unique: true,                                       // Index unique dans MongoDB
        lowercase: true,                                    // Conversion en minuscules
        trim: true,                                         // Suppression des espaces
        match: [/\S+@\S+\.\S+/, 'Format d\'email invalide'] // Validation regex
    },

    /**
     * Mot de passe de l'utilisateur
     * - Obligatoire pour l'inscription
     * - Minimum 6 caractères pour la sécurité
     * - Sera hashé avant la sauvegarde (voir pre-save hook)
     */
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    },

    /**
     * Rôle de l'utilisateur dans le système
     * - student: Étudiant (par défaut) - peut s'inscrire aux cours
     * - instructor: Formateur - peut créer des cours
     * - admin: Administrateur - accès complet
     */
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],  // Valeurs autorisées
        default: 'student'                          // Valeur par défaut
    },

    /**
     * RELATION 1-to-1 avec Profile
     * Référence vers le document Profile associé à cet utilisateur
     * Chaque utilisateur a exactement un profil
     */
    profile: {
        type: mongoose.Schema.Types.ObjectId,  // Type ObjectId de MongoDB
        ref: 'Profile'                          // Référence au modèle Profile
    },

    /**
     * RELATION Many-to-Many avec Course (inscriptions)
     * Liste des cours auxquels l'étudiant est inscrit
     * Un utilisateur peut être inscrit à plusieurs cours
     */
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, {
    /**
     * Options du schéma
     * timestamps: true ajoute automatiquement createdAt et updatedAt
     */
    timestamps: true
});

// =========================================================================
// MIDDLEWARE PRE-SAVE (HASHAGE DU MOT DE PASSE)
// =========================================================================

/**
 * Hook pre-save - S'exécute avant chaque sauvegarde du document
 * 
 * Ce middleware hache le mot de passe uniquement si:
 * - C'est un nouveau document, OU
 * - Le mot de passe a été modifié
 * 
 * Cela évite de re-hasher un mot de passe déjà hashé
 */
userSchema.pre('save', async function (next) {
    // Si le mot de passe n'a pas été modifié, passer au middleware suivant
    if (!this.isModified('password')) {
        next();
    }

    // Générer un "salt" (chaîne aléatoire) avec un coût de 10
    // Plus le coût est élevé, plus le hashage est sécurisé mais lent
    const salt = await bcrypt.genSalt(10);

    // Hasher le mot de passe avec le salt
    // Le résultat est une chaîne de ~60 caractères
    this.password = await bcrypt.hash(this.password, salt);
});

// =========================================================================
// MÉTHODES D'INSTANCE
// =========================================================================

/**
 * Méthode pour comparer les mots de passe lors de la connexion
 * 
 * Compare le mot de passe en clair entré par l'utilisateur
 * avec le mot de passe hashé stocké en base de données
 * 
 * @param {string} enteredPassword - Mot de passe entré lors de la connexion
 * @returns {Promise<boolean>} - true si les mots de passe correspondent
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    // bcrypt.compare hache le mot de passe entré et le compare
    return await bcrypt.compare(enteredPassword, this.password);
};

// =========================================================================
// EXPORT DU MODÈLE
// =========================================================================

// Créer et exporter le modèle User basé sur le schéma
// mongoose.model() crée une collection 'users' dans MongoDB
module.exports = mongoose.model('User', userSchema);
