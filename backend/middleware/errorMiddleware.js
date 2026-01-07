/**
 * =========================================================================
 * MIDDLEWARE DE GESTION DES ERREURS
 * =========================================================================
 * 
 * Ce fichier contient les middlewares de gestion centralisée des erreurs.
 * Ils permettent de:
 * - Standardiser les réponses d'erreur de l'API
 * - Gérer les erreurs de manière centralisée
 * - Fournir des messages d'erreur utiles en développement
 * 
 * TYPES D'ERREURS GÉRÉES:
 * - 404 Not Found: Route non trouvée
 * - 400 Bad Request: Validation Mongoose, duplications
 * - 500 Internal Server Error: Erreurs non gérées
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// MIDDLEWARE 404 - ROUTE NON TROUVÉE
// =========================================================================

/**
 * Middleware notFound - Gère les routes inexistantes
 * 
 * Ce middleware intercepte toutes les requêtes qui n'ont pas
 * trouvé de route correspondante dans l'application.
 * 
 * Il doit être placé APRÈS toutes les routes de l'application.
 * 
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction pour passer au middleware suivant
 */
const notFound = (req, res, next) => {
    // Créer une nouvelle erreur avec l'URL demandée
    const error = new Error(`Route non trouvée - ${req.originalUrl}`);

    // Définir le code de statut HTTP à 404
    res.status(404);

    // Passer l'erreur au middleware errorHandler
    next(error);
};

// =========================================================================
// MIDDLEWARE GLOBAL DE GESTION DES ERREURS
// =========================================================================

/**
 * Middleware errorHandler - Gestion centralisée des erreurs
 * 
 * Ce middleware attrape toutes les erreurs de l'application et
 * renvoie une réponse JSON standardisée.
 * 
 * Il doit être le DERNIER middleware de l'application.
 * 
 * ERREURS SPÉCIALES GÉRÉES:
 * - CastError: ID MongoDB invalide → 404
 * - ValidationError: Validation Mongoose échouée → 400
 * - Code 11000: Violation de contrainte unique → 400
 * 
 * @param {Error} err - L'erreur attrapée
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction pour passer au middleware suivant
 */
const errorHandler = (err, req, res, next) => {
    // Si le statut est 200, c'est une erreur non gérée → 500
    // Sinon, on garde le statut déjà défini
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // =====================================================================
    // GESTION DES ERREURS MONGOOSE SPÉCIFIQUES
    // =====================================================================

    /**
     * Erreur CastError - ID MongoDB invalide
     * 
     * Se produit quand un ID n'est pas au format ObjectId valide
     * Exemple: GET /api/courses/invalid-id
     */
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;  // Not Found (ressource inexistante)
        message = 'Ressource non trouvée';
    }

    /**
     * Erreur ValidationError - Validation Mongoose échouée
     * 
     * Se produit quand les données ne respectent pas le schéma
     * Exemple: Email invalide, champ requis manquant
     */
    if (err.name === 'ValidationError') {
        statusCode = 400;  // Bad Request
        // Concaténer tous les messages de validation
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }

    /**
     * Erreur 11000 - Violation de contrainte unique
     * 
     * Se produit quand on tente d'insérer une valeur déjà existante
     * dans un champ avec contrainte unique (email, nom de catégorie)
     */
    if (err.code === 11000) {
        statusCode = 400;  // Bad Request
        // Extraire le nom du champ en doublon
        const field = Object.keys(err.keyValue)[0];
        message = `Duplication détectée: ${field} existe déjà`;
    }

    // =====================================================================
    // ENVOI DE LA RÉPONSE D'ERREUR
    // =====================================================================

    res.status(statusCode).json({
        message,
        // Inclure la stack trace uniquement en développement
        // En production, on ne veut pas exposer les détails internes
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// =========================================================================
// EXPORT DES MIDDLEWARES
// =========================================================================

module.exports = { notFound, errorHandler };
