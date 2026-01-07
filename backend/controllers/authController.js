/**
 * =========================================================================
 * CONTRÔLEUR D'AUTHENTIFICATION
 * =========================================================================
 * 
 * Ce contrôleur gère toutes les opérations d'authentification:
 * - Inscription (register): Création d'un nouveau compte utilisateur
 * - Connexion (login): Authentification et génération du token JWT
 * - Profil (getMe): Récupération des informations de l'utilisateur connecté
 * - Déconnexion (logout): Invalidation côté client
 * 
 * SÉCURITÉ:
 * - Utilise JWT (JSON Web Tokens) pour l'authentification stateless
 * - Les mots de passe sont hashés avec bcrypt (dans le modèle User)
 * - Le token JWT expire après 30 jours (configurable dans .env)
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// jsonwebtoken - Bibliothèque pour créer et vérifier les tokens JWT
const jwt = require('jsonwebtoken');

// express-async-handler - Wrapper pour gérer les exceptions async automatiquement
// Évite d'écrire try/catch dans chaque fonction async
const asyncHandler = require('express-async-handler');

// Modèles Mongoose
const User = require('../models/User');
const Profile = require('../models/Profile');

// =========================================================================
// FONCTIONS UTILITAIRES
// =========================================================================

/**
 * Génère un token JWT pour un utilisateur
 * 
 * Le token contient l'ID de l'utilisateur et expire après JWT_EXPIRE jours.
 * Le secret JWT_SECRET est utilisé pour signer le token.
 * 
 * @param {string} id - L'ID de l'utilisateur à encoder dans le token
 * @returns {string} - Le token JWT signé
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },                          // Payload: données encodées dans le token
        process.env.JWT_SECRET,          // Secret pour signer le token
        { expiresIn: process.env.JWT_EXPIRE }  // Durée de validité (ex: "30d")
    );
};

// =========================================================================
// CONTRÔLEURS
// =========================================================================

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public (pas de token requis)
 * 
 * Cette fonction:
 * 1. Vérifie que l'email n'est pas déjà utilisé
 * 2. Crée un nouveau document User
 * 3. Crée automatiquement un document Profile associé (relation 1-to-1)
 * 4. Met à jour l'utilisateur avec la référence du profil
 * 5. Retourne les informations utilisateur avec un token JWT
 */
const register = asyncHandler(async (req, res) => {
    // Extraire les données du corps de la requête
    const { email, password, firstName, lastName, role } = req.body;

    // Vérifier si un utilisateur avec cet email existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);  // Bad Request
        throw new Error('Cet email est déjà utilisé');
    }

    // Créer le nouvel utilisateur dans la base de données
    // Le mot de passe sera automatiquement hashé par le hook pre-save
    const user = await User.create({
        email,
        password,
        role: role || 'student',  // Rôle par défaut: étudiant
    });

    // Si l'utilisateur a été créé avec succès
    if (user) {
        // Valider que firstName et lastName sont fournis pour le profil
        if (!firstName || !lastName) {
            res.status(400);
            throw new Error('Le prénom et le nom sont requis');
        }

        // Créer le profil associé (RELATION 1-to-1)
        // Le profil contient les informations personnelles de l'utilisateur
        const profile = await Profile.create({
            user: user._id,      // Lier le profil à l'utilisateur
            firstName,
            lastName,
        });

        // Mettre à jour l'utilisateur avec la référence du profil
        // Note: On utilise findByIdAndUpdate pour éviter de déclencher 
        // le hook pre-save qui re-hasherait le mot de passe
        await User.findByIdAndUpdate(user._id, { profile: profile._id });

        // Retourner les informations utilisateur avec le token JWT
        res.status(201).json({  // 201 Created
            _id: user._id,
            email: user.email,
            role: user.role,
            profile: {
                _id: profile._id,
                firstName: profile.firstName,
                lastName: profile.lastName,
            },
            token: generateToken(user._id),  // Token JWT pour l'authentification
        });
    } else {
        res.status(400);
        throw new Error('Données utilisateur invalides');
    }
});

/**
 * @desc    Connexion d'un utilisateur existant
 * @route   POST /api/auth/login
 * @access  Public (pas de token requis)
 * 
 * Cette fonction:
 * 1. Recherche l'utilisateur par email
 * 2. Vérifie le mot de passe avec bcrypt
 * 3. Si valide, retourne les informations avec un nouveau token JWT
 */
const login = asyncHandler(async (req, res) => {
    // Extraire email et mot de passe du corps de la requête
    const { email, password } = req.body;

    // Rechercher l'utilisateur par email et inclure son profil
    // populate('profile') remplace l'ObjectId par le document Profile complet
    const user = await User.findOne({ email }).populate('profile');

    // Vérifier si l'utilisateur existe ET si le mot de passe correspond
    // matchPassword() est une méthode définie dans le modèle User
    if (user && (await user.matchPassword(password))) {
        // Connexion réussie: retourner les informations et le token
        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            profile: user.profile,
            token: generateToken(user._id),
        });
    } else {
        // Échec de la connexion
        res.status(401);  // Unauthorized
        throw new Error('Email ou mot de passe incorrect');
    }
});

/**
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @route   GET /api/auth/me
 * @access  Private (token JWT requis)
 * 
 * Cette fonction:
 * 1. Utilise req.user (ajouté par le middleware protect)
 * 2. Récupère toutes les informations de l'utilisateur
 * 3. Inclut le profil et les cours inscrits
 */
const getMe = asyncHandler(async (req, res) => {
    // req.user est défini par le middleware protect (authMiddleware)
    // Il contient l'utilisateur authentifié (sans le mot de passe)
    const user = await User.findById(req.user._id)
        .select('-password')          // Exclure le mot de passe de la réponse
        .populate('profile')          // Inclure le document Profile complet
        .populate('enrolledCourses'); // Inclure la liste des cours inscrits

    res.json(user);
});

/**
 * @desc    Déconnexion de l'utilisateur
 * @route   POST /api/auth/logout
 * @access  Private (token JWT requis)
 * 
 * Note: Avec JWT, la déconnexion se fait côté client
 * Le client doit simplement supprimer le token de son stockage local
 * Cette route existe pour la cohérence de l'API
 */
const logout = asyncHandler(async (req, res) => {
    // La déconnexion effective se fait côté client
    // en supprimant le token du localStorage
    res.json({ message: 'Déconnexion réussie' });
});

// =========================================================================
// EXPORT DES FONCTIONS
// =========================================================================

module.exports = {
    register,   // POST /api/auth/register
    login,      // POST /api/auth/login
    getMe,      // GET /api/auth/me
    logout,     // POST /api/auth/logout
};
