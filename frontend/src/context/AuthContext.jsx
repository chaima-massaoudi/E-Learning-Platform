/**
 * =========================================================================
 * CONTEXTE D'AUTHENTIFICATION (AuthContext.jsx)
 * =========================================================================
 * 
 * Ce fichier gère l'état d'authentification global de l'application.
 * Il utilise le Context API de React pour partager les données utilisateur
 * dans toute l'arborescence des composants.
 * 
 * FONCTIONNALITÉS:
 * - Stockage de l'utilisateur connecté
 * - Fonctions de connexion/déconnexion
 * - Persistance dans localStorage
 * - Hook useAuth() pour accéder au contexte
 * 
 * PATRONS DE CONCEPTION:
 * - Context API: Partage d'état sans prop drilling
 * - Custom Hook: Encapsulation de la logique d'accès
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// =========================================================================
// CRÉATION DU CONTEXTE
// =========================================================================

/**
 * Contexte d'authentification
 * Initialisé à null, sera rempli par le Provider
 */
const AuthContext = createContext(null);

// =========================================================================
// HOOK PERSONNALISÉ
// =========================================================================

/**
 * Hook useAuth - Accès simplifié au contexte d'authentification
 * 
 * Ce hook doit être utilisé dans un composant enfant de AuthProvider.
 * Il lève une erreur explicite si utilisé en dehors du contexte.
 * 
 * @returns {Object} - { user, loading, login, register, logout, updateUser, isAuthenticated }
 * @throws {Error} - Si utilisé en dehors de AuthProvider
 * 
 * @example
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    // Vérifier que le hook est utilisé dans un AuthProvider
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

// =========================================================================
// COMPOSANT PROVIDER
// =========================================================================

/**
 * AuthProvider - Fournisseur du contexte d'authentification
 * 
 * Ce composant doit englober l'application pour que useAuth() fonctionne.
 * Il gère:
 * - L'état de l'utilisateur connecté
 * - La persistance dans localStorage
 * - Les fonctions de login/register/logout
 * 
 * @param {Object} props - Props du composant
 * @param {ReactNode} props.children - Les composants enfants
 */
export const AuthProvider = ({ children }) => {
    // =====================================================================
    // ÉTAT LOCAL
    // =====================================================================

    /**
     * Utilisateur actuellement connecté
     * null si non connecté, objet { _id, email, role, profile } si connecté
     */
    const [user, setUser] = useState(null);

    /**
     * Indicateur de chargement initial
     * true pendant la vérification du localStorage au démarrage
     */
    const [loading, setLoading] = useState(true);

    // =====================================================================
    // EFFET DE RÉHYDRATATION
    // =====================================================================

    /**
     * Effet au montage: Récupérer les données de session depuis localStorage
     * 
     * Cet effet s'exécute une seule fois au chargement de l'application
     * pour restaurer la session utilisateur si elle existe.
     */
    useEffect(() => {
        // Récupérer le token et les données utilisateur du localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // Si les deux existent, restaurer la session
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Indiquer que le chargement initial est terminé
        setLoading(false);
    }, []);  // [] = exécuté uniquement au montage

    // =====================================================================
    // FONCTIONS D'AUTHENTIFICATION
    // =====================================================================

    /**
     * Fonction login - Connexion de l'utilisateur
     * 
     * Cette fonction:
     * 1. Appelle l'API de connexion
     * 2. Stocke le token et les données dans localStorage
     * 3. Met à jour l'état user
     * 
     * @param {string} email - Adresse email de l'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Object} - Les données utilisateur (sans le token)
     */
    const login = async (email, password) => {
        // Appeler l'API de connexion
        const response = await authAPI.login({ email, password });

        // Séparer le token des autres données utilisateur
        const { token, ...userData } = response.data;

        // Stocker dans localStorage pour la persistance
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Mettre à jour l'état React
        setUser(userData);

        return userData;
    };

    /**
     * Fonction register - Inscription d'un nouvel utilisateur
     * 
     * Similaire à login, mais appelle l'endpoint d'inscription.
     * Connecte automatiquement l'utilisateur après inscription.
     * 
     * @param {Object} userData - { email, password, firstName, lastName, role? }
     * @returns {Object} - Les données du nouvel utilisateur
     */
    const register = async (userData) => {
        // Appeler l'API d'inscription
        const response = await authAPI.register(userData);

        // Séparer le token des données utilisateur
        const { token, ...userInfo } = response.data;

        // Stocker dans localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userInfo));

        // Mettre à jour l'état React
        setUser(userInfo);

        return userInfo;
    };

    /**
     * Fonction logout - Déconnexion de l'utilisateur
     * 
     * Cette fonction:
     * 1. Supprime les données de localStorage
     * 2. Réinitialise l'état user à null
     * 
     * Note: Pas d'appel API car JWT est stateless
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    /**
     * Fonction updateUser - Met à jour les données utilisateur locales
     * 
     * Utilisée après modification du profil pour synchroniser
     * l'état React avec les nouvelles données.
     * 
     * @param {Object} userData - Les nouvelles données utilisateur
     */
    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // =====================================================================
    // VALEUR DU CONTEXTE
    // =====================================================================

    /**
     * Objet exposé par le contexte
     * Contient toutes les données et fonctions accessibles via useAuth()
     */
    const value = {
        user,              // Utilisateur connecté ou null
        loading,           // true pendant le chargement initial
        login,             // Fonction de connexion
        register,          // Fonction d'inscription
        logout,            // Fonction de déconnexion
        updateUser,        // Fonction de mise à jour du profil
        isAuthenticated: !!user,  // Booléen: l'utilisateur est-il connecté?
    };

    // =====================================================================
    // RENDU
    // =====================================================================

    return (
        // Fournir le contexte à tous les composants enfants
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
