/**
 * =========================================================================
 * COMPOSANT PROTECTEDROUTE (Route Protégée)
 * =========================================================================
 * 
 * Ce composant est un HOC (Higher-Order Component) qui protège les routes
 * nécessitant une authentification ou un rôle spécifique.
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie si l'utilisateur est authentifié
 * 2. Vérifie si l'utilisateur a le rôle requis (optionnel)
 * 3. Affiche le composant enfant ou redirige
 * 
 * USAGE:
 * <ProtectedRoute>
 *   <DashboardPage /> // Accessible à tous les utilisateurs connectés
 * </ProtectedRoute>
 * 
 * <ProtectedRoute roles={['admin']}>
 *   <AdminPage /> // Accessible uniquement aux admins
 * </ProtectedRoute>
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// Navigate - Composant de redirection de React Router
import { Navigate } from 'react-router-dom';

// Hook d'authentification
import { useAuth } from '../context/AuthContext';

// =========================================================================
// COMPOSANT PROTECTEDROUTE
// =========================================================================

/**
 * Composant ProtectedRoute - Protection des routes
 * 
 * @param {Object} props - Props du composant
 * @param {ReactNode} props.children - Le composant page à afficher si autorisé
 * @param {Array<string>} props.roles - Liste des rôles autorisés (optionnel)
 * @returns {ReactNode} - L'enfant, un spinner, ou une redirection
 */
const ProtectedRoute = ({ children, roles = [] }) => {
    // Récupérer l'état d'authentification
    const { user, loading, isAuthenticated } = useAuth();

    // =====================================================================
    // ÉTAT DE CHARGEMENT
    // =====================================================================

    /**
     * Si le contexte d'authentification est en cours de chargement,
     * afficher un spinner pour éviter un flash de redirection
     */
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    // =====================================================================
    // VÉRIFICATION D'AUTHENTIFICATION
    // =====================================================================

    /**
     * Si l'utilisateur n'est pas authentifié,
     * le rediriger vers la page de connexion
     * 
     * replace: true empêche d'ajouter une entrée dans l'historique
     * (l'utilisateur ne pourra pas revenir en arrière sur cette route)
     */
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // =====================================================================
    // VÉRIFICATION DES RÔLES
    // =====================================================================

    /**
     * Si des rôles sont spécifiés et que l'utilisateur n'a pas
     * l'un de ces rôles, le rediriger vers la page d'accueil
     * 
     * roles.length > 0: On vérifie les rôles uniquement s'ils sont spécifiés
     * !roles.includes(user?.role): L'utilisateur n'a pas un rôle autorisé
     */
    if (roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    // =====================================================================
    // RENDU AUTORISÉ
    // =====================================================================

    /**
     * L'utilisateur est authentifié et a le rôle requis (si spécifié)
     * Afficher le composant enfant
     */
    return children;
};

// Exporter le composant
export default ProtectedRoute;
