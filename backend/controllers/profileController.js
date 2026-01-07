/**
 * =========================================================================
 * CONTRÔLEUR DES PROFILS
 * =========================================================================
 * 
 * Ce contrôleur gère les opérations sur les profils utilisateurs.
 * 
 * RELATION 1-to-1 avec User:
 * - Chaque utilisateur a exactement un profil
 * - Le profil contient les informations personnelles (nom, prénom, bio, etc.)
 * 
 * ACCÈS:
 * - Lecture d'un profil: Utilisateur connecté
 * - Modification: Propriétaire du profil ou admin
 * - Liste de tous les profils: Admin uniquement
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

const asyncHandler = require('express-async-handler');
const Profile = require('../models/Profile');
const User = require('../models/User');

// =========================================================================
// CONTRÔLEURS - LECTURE (READ)
// =========================================================================

/**
 * @desc    Récupérer le profil d'un utilisateur
 * @route   GET /api/profiles/:userId
 * @access  Private (utilisateur connecté)
 * 
 * Retourne le profil complet d'un utilisateur avec ses informations
 */
const getProfile = asyncHandler(async (req, res) => {
    // Rechercher le profil par l'ID de l'utilisateur
    // Note: On cherche par 'user', pas par '_id' du profil
    const profile = await Profile.findOne({ user: req.params.userId }).populate(
        'user',
        'email role'  // Inclure email et rôle de l'utilisateur
    );

    // Vérifier si le profil existe
    if (!profile) {
        res.status(404);
        throw new Error('Profil non trouvé');
    }

    res.json(profile);
});

/**
 * @desc    Récupérer tous les profils
 * @route   GET /api/profiles
 * @access  Private/Admin
 * 
 * Permet à l'admin de voir tous les profils de la plateforme
 */
const getAllProfiles = asyncHandler(async (req, res) => {
    // Rechercher tous les profils avec les informations utilisateur
    const profiles = await Profile.find().populate('user', 'email role');

    res.json(profiles);
});

// =========================================================================
// CONTRÔLEURS - MODIFICATION (UPDATE)
// =========================================================================

/**
 * @desc    Mettre à jour un profil
 * @route   PUT /api/profiles/:userId
 * @access  Private (propriétaire du profil ou admin)
 * 
 * Cette fonction:
 * 1. Vérifie que l'utilisateur est autorisé
 * 2. Met à jour les champs fournis
 * 3. Retourne le profil mis à jour
 */
const updateProfile = asyncHandler(async (req, res) => {
    // VÉRIFICATION D'AUTORISATION
    // Seul le propriétaire du profil ou un admin peut le modifier
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
        res.status(403);  // Forbidden
        throw new Error('Non autorisé à modifier ce profil');
    }

    // Rechercher le profil de l'utilisateur
    const profile = await Profile.findOne({ user: req.params.userId });

    if (!profile) {
        res.status(404);
        throw new Error('Profil non trouvé');
    }

    // Extraire les nouvelles données du corps de la requête
    const { firstName, lastName, bio, avatar, phone, address } = req.body;

    // Mettre à jour uniquement les champs fournis
    // On vérifie !== undefined pour permettre de vider des champs avec ''
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (bio !== undefined) profile.bio = bio;
    if (avatar !== undefined) profile.avatar = avatar;
    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;

    // Sauvegarder les modifications
    const updatedProfile = await profile.save();

    res.json(updatedProfile);
});

// =========================================================================
// EXPORT DES FONCTIONS
// =========================================================================

module.exports = {
    getProfile,      // GET /api/profiles/:userId
    updateProfile,   // PUT /api/profiles/:userId
    getAllProfiles,  // GET /api/profiles
};
