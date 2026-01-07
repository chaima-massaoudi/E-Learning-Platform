/**
 * =========================================================================
 * MIDDLEWARE D'AUTHENTIFICATION
 * =========================================================================
 * 
 * Ce fichier contient les middlewares de sécurité pour l'API:
 * - protect: Vérifie que l'utilisateur est authentifié (token JWT valide)
 * - authorize: Vérifie que l'utilisateur a le rôle requis
 * 
 * FONCTIONNEMENT JWT:
 * 1. Le client envoie le token dans le header Authorization: Bearer <token>
 * 2. Le middleware extrait et vérifie le token
 * 3. Si valide, l'utilisateur est ajouté à req.user
 * 4. Si invalide, une erreur 401 est retournée
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// jsonwebtoken - Pour vérifier et décoder les tokens JWT
const jwt = require('jsonwebtoken');

// express-async-handler - Wrapper pour gérer les exceptions async
const asyncHandler = require('express-async-handler');

// Modèle User pour rechercher l'utilisateur
const User = require('../models/User');

// =========================================================================
// MIDDLEWARE DE PROTECTION DES ROUTES
// =========================================================================

/**
 * Middleware protect - Vérifie l'authentification JWT
 * 
 * Ce middleware:
 * 1. Extrait le token du header Authorization
 * 2. Vérifie la validité du token avec le secret JWT
 * 3. Recherche l'utilisateur correspondant dans la base de données
 * 4. Ajoute l'utilisateur à req.user pour les handlers suivants
 * 
 * Usage dans les routes:
 * router.get('/protected', protect, handler);
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Vérifier si le header Authorization existe et commence par 'Bearer'
    // Format attendu: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extraire le token du header (après "Bearer ")
            // split(' ')[1] récupère la deuxième partie après l'espace
            token = req.headers.authorization.split(' ')[1];

            // Vérifier et décoder le token
            // jwt.verify() lève une exception si le token est invalide ou expiré
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Rechercher l'utilisateur par l'ID contenu dans le token
            // .select('-password') exclut le mot de passe des données
            req.user = await User.findById(decoded.id).select('-password');

            // Passer au middleware/handler suivant
            next();
        } catch (error) {
            // Token invalide ou expiré
            console.error(error);
            res.status(401);  // Unauthorized
            throw new Error('Non autorisé, token invalide');
        }
    }

    // Si aucun token n'a été trouvé dans le header
    if (!token) {
        res.status(401);  // Unauthorized
        throw new Error('Non autorisé, pas de token');
    }
});

// =========================================================================
// MIDDLEWARE D'AUTORISATION PAR RÔLE
// =========================================================================

/**
 * Middleware authorize - Vérifie les rôles autorisés
 * 
 * Ce middleware vérifie que l'utilisateur connecté a l'un des rôles
 * spécifiés. Il doit être utilisé APRÈS le middleware protect.
 * 
 * @param {...string} roles - Liste des rôles autorisés
 * @returns {Function} - Middleware Express
 * 
 * Usage dans les routes:
 * router.post('/admin-only', protect, authorize('admin'), handler);
 * router.post('/create-course', protect, authorize('instructor', 'admin'), handler);
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
        // req.user est défini par le middleware protect
        if (!roles.includes(req.user.role)) {
            res.status(403);  // Forbidden (différent de 401 Unauthorized)
            throw new Error(
                `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`
            );
        }

        // Rôle autorisé, passer au handler suivant
        next();
    };
};

// =========================================================================
// EXPORT DES MIDDLEWARES
// =========================================================================

module.exports = { protect, authorize };
