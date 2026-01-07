/**
 * =========================================================================
 * CONTRÔLEUR DES UTILISATEURS
 * =========================================================================
 * 
 * Ce contrôleur gère les opérations CRUD sur les utilisateurs.
 * 
 * Note: L'inscription et la connexion sont gérées par authController
 * Ce contrôleur gère les opérations après la création du compte.
 * 
 * ACCÈS:
 * - Liste des utilisateurs: Admin uniquement
 * - Détails d'un utilisateur: Utilisateur connecté
 * - Modification: Propriétaire du compte ou admin
 * - Suppression: Admin uniquement
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// =========================================================================
// CONTRÔLEURS - LECTURE (READ)
// =========================================================================

/**
 * @desc    Récupérer tous les utilisateurs
 * @route   GET /api/users
 * @access  Private/Admin
 * 
 * Retourne la liste de tous les utilisateurs (pour l'administration)
 * Les mots de passe sont exclus de la réponse pour la sécurité
 */
const getAllUsers = asyncHandler(async (req, res) => {
    // Rechercher tous les utilisateurs
    // .select('-password') exclut le mot de passe de la réponse
    const users = await User.find().select('-password').populate('profile');

    res.json(users);
});

/**
 * @desc    Récupérer un utilisateur par son ID
 * @route   GET /api/users/:id
 * @access  Private (utilisateur connecté)
 * 
 * Retourne les détails d'un utilisateur avec son profil et ses cours
 */
const getUserById = asyncHandler(async (req, res) => {
    // Rechercher l'utilisateur par son ID
    const user = await User.findById(req.params.id)
        .select('-password')           // Exclure le mot de passe
        .populate('profile')           // Inclure le profil complet
        .populate('enrolledCourses');  // Inclure les cours inscrits

    // Vérifier si l'utilisateur existe
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
});

// =========================================================================
// CONTRÔLEURS - MODIFICATION (UPDATE)
// =========================================================================

/**
 * @desc    Mettre à jour un utilisateur
 * @route   PUT /api/users/:id
 * @access  Private (propriétaire du compte ou admin)
 * 
 * Permet de modifier l'email et le rôle d'un utilisateur
 * Note: La modification du mot de passe devrait être gérée séparément
 */
const updateUser = asyncHandler(async (req, res) => {
    // Rechercher l'utilisateur à modifier
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }

    // VÉRIFICATION D'AUTORISATION
    // Seul le propriétaire du compte ou un admin peut le modifier
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
        res.status(403);  // Forbidden
        throw new Error('Non autorisé à modifier cet utilisateur');
    }

    // Extraire les nouvelles données
    const { email, role } = req.body;

    // Mettre à jour l'email si fourni
    if (email) user.email = email;

    // Mettre à jour le rôle UNIQUEMENT si l'utilisateur est admin
    // Un utilisateur ne peut pas changer son propre rôle en admin
    if (role && req.user.role === 'admin') user.role = role;

    // Sauvegarder les modifications
    const updatedUser = await user.save();

    // Retourner les informations mises à jour (sans le mot de passe)
    res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
    });
});

// =========================================================================
// CONTRÔLEURS - SUPPRESSION (DELETE)
// =========================================================================

/**
 * @desc    Supprimer un utilisateur
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 * 
 * Supprime définitivement un compte utilisateur
 * Note: Dans un cas réel, on devrait aussi supprimer le profil associé
 * et nettoyer les autres références (cours créés, inscriptions, avis)
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Utilisateur supprimé avec succès', id: req.params.id });
});

// =========================================================================
// EXPORT DES FONCTIONS
// =========================================================================

module.exports = {
    getAllUsers,   // GET /api/users
    getUserById,   // GET /api/users/:id
    updateUser,    // PUT /api/users/:id
    deleteUser,    // DELETE /api/users/:id
};
