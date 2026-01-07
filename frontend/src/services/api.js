/**
 * =========================================================================
 * SERVICE API (api.js)
 * =========================================================================
 * 
 * Ce fichier configure Axios et fournit des fonctions pour appeler l'API backend.
 * Il centralise toutes les requêtes HTTP de l'application.
 * 
 * FONCTIONNALITÉS:
 * - Configuration d'Axios avec l'URL de base
 * - Intercepteur pour ajouter le token JWT aux requêtes
 * - Intercepteur pour gérer les erreurs (notamment 401)
 * - Objets API groupés par ressource
 * 
 * USAGE:
 * import { coursesAPI, authAPI } from './services/api';
 * const courses = await coursesAPI.getAll();
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// Axios - Client HTTP pour les requêtes API
import axios from 'axios';

// =========================================================================
// CONFIGURATION D'AXIOS
// =========================================================================

/**
 * URL de base de l'API backend
 * En développement: http://localhost:5000/api
 * En production: À remplacer par l'URL du serveur déployé
 */
const API_URL = 'http://localhost:5000/api';

/**
 * Instance Axios configurée
 * Toutes les requêtes passeront par cette instance
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',  // Format des données envoyées
    },
});

// =========================================================================
// INTERCEPTEUR DE REQUÊTES
// =========================================================================

/**
 * Intercepteur de requêtes sortantes
 * 
 * Cet intercepteur s'exécute AVANT chaque requête HTTP.
 * Il ajoute automatiquement le token JWT dans le header Authorization.
 * 
 * Format du header: "Authorization: Bearer <token>"
 */
api.interceptors.request.use(
    (config) => {
        // Récupérer le token depuis localStorage
        const token = localStorage.getItem('token');

        // Si un token existe, l'ajouter au header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // En cas d'erreur de configuration, rejeter la promesse
        return Promise.reject(error);
    }
);

// =========================================================================
// INTERCEPTEUR DE RÉPONSES
// =========================================================================

/**
 * Intercepteur de réponses entrantes
 * 
 * Cet intercepteur s'exécute APRÈS chaque réponse du serveur.
 * Il gère notamment les erreurs 401 (token invalide ou expiré).
 */
api.interceptors.response.use(
    // Cas de succès: retourner la réponse telle quelle
    (response) => response,

    // Cas d'erreur: gérer les erreurs globalement
    (error) => {
        // Si erreur 401 (Unauthorized), déconnecter l'utilisateur
        if (error.response?.status === 401) {
            // Supprimer les données de session
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Rediriger vers la page de connexion
            window.location.href = '/login';
        }

        // Propager l'erreur pour qu'elle soit gérée par le composant
        return Promise.reject(error);
    }
);

// =========================================================================
// API D'AUTHENTIFICATION
// =========================================================================

/**
 * Objet authAPI - Fonctions d'authentification
 * 
 * @property {Function} register - Inscription
 * @property {Function} login - Connexion
 * @property {Function} getMe - Profil utilisateur connecté
 * @property {Function} logout - Déconnexion
 */
export const authAPI = {
    // POST /api/auth/register
    register: (data) => api.post('/auth/register', data),

    // POST /api/auth/login
    login: (data) => api.post('/auth/login', data),

    // GET /api/auth/me
    getMe: () => api.get('/auth/me'),

    // POST /api/auth/logout
    logout: () => api.post('/auth/logout'),
};

// =========================================================================
// API DES COURS
// =========================================================================

/**
 * Objet coursesAPI - Fonctions CRUD pour les cours
 * 
 * @property {Function} getAll - Liste des cours publiés
 * @property {Function} getById - Détails d'un cours
 * @property {Function} create - Créer un cours
 * @property {Function} update - Modifier un cours
 * @property {Function} delete - Supprimer un cours
 * @property {Function} enroll - S'inscrire à un cours
 * @property {Function} unenroll - Se désinscrire d'un cours
 */
export const coursesAPI = {
    // GET /api/courses
    getAll: () => api.get('/courses'),

    // GET /api/courses/:id
    getById: (id) => api.get(`/courses/${id}`),

    // POST /api/courses
    create: (data) => api.post('/courses', data),

    // PUT /api/courses/:id
    update: (id, data) => api.put(`/courses/${id}`, data),

    // DELETE /api/courses/:id
    delete: (id) => api.delete(`/courses/${id}`),

    // POST /api/courses/:id/enroll
    enroll: (id) => api.post(`/courses/${id}/enroll`),

    // DELETE /api/courses/:id/enroll
    unenroll: (id) => api.delete(`/courses/${id}/enroll`),
};

// =========================================================================
// API DES AVIS
// =========================================================================

/**
 * Objet reviewsAPI - Fonctions CRUD pour les avis
 */
export const reviewsAPI = {
    // GET /api/reviews/course/:courseId
    getByCourse: (courseId) => api.get(`/reviews/course/${courseId}`),

    // POST /api/reviews
    create: (data) => api.post('/reviews', data),

    // PUT /api/reviews/:id
    update: (id, data) => api.put(`/reviews/${id}`, data),

    // DELETE /api/reviews/:id
    delete: (id) => api.delete(`/reviews/${id}`),
};

// =========================================================================
// API DES CATÉGORIES
// =========================================================================

/**
 * Objet categoriesAPI - Fonctions CRUD pour les catégories
 */
export const categoriesAPI = {
    // GET /api/categories
    getAll: () => api.get('/categories'),

    // GET /api/categories/:id
    getById: (id) => api.get(`/categories/${id}`),

    // POST /api/categories (Admin)
    create: (data) => api.post('/categories', data),

    // PUT /api/categories/:id (Admin)
    update: (id, data) => api.put(`/categories/${id}`, data),

    // DELETE /api/categories/:id (Admin)
    delete: (id) => api.delete(`/categories/${id}`),
};

// =========================================================================
// API DES PROFILS
// =========================================================================

/**
 * Objet profilesAPI - Fonctions pour les profils utilisateurs
 */
export const profilesAPI = {
    // GET /api/profiles/:userId
    get: (userId) => api.get(`/profiles/${userId}`),

    // PUT /api/profiles/:userId
    update: (userId, data) => api.put(`/profiles/${userId}`, data),
};

// =========================================================================
// EXPORT PAR DÉFAUT
// =========================================================================

// Exporter l'instance Axios pour les cas personnalisés
export default api;
