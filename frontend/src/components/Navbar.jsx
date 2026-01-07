/**
 * =========================================================================
 * COMPOSANT NAVBAR (Barre de Navigation)
 * =========================================================================
 * 
 * Ce composant affiche la barre de navigation principale de l'application.
 * Il s'adapte dynamiquement selon l'état de connexion et le rôle de l'utilisateur.
 * 
 * AFFICHAGE CONDITIONNEL:
 * - Non connecté: Liens vers Connexion et Inscription
 * - Connecté: Liens vers Dashboard, Profil, et bouton Déconnexion
 * - Instructor/Admin: Lien vers Créer un cours
 * - Admin uniquement: Lien vers la page Admin
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// React Router - Navigation
import { Link, NavLink, useNavigate } from 'react-router-dom';

// Hook d'authentification pour accéder à l'état utilisateur
import { useAuth } from '../context/AuthContext';

// Styles du composant
import './Navbar.css';

// =========================================================================
// COMPOSANT NAVBAR
// =========================================================================

/**
 * Composant Navbar - Barre de navigation principale
 * 
 * Utilise NavLink au lieu de Link pour les liens actifs (style différent)
 * NavLink ajoute automatiquement une classe 'active' au lien de la page courante
 */
const Navbar = () => {
    // Récupérer les données d'authentification du contexte
    const { user, logout, isAuthenticated } = useAuth();

    // Hook pour la navigation programmatique
    const navigate = useNavigate();

    /**
     * Gère la déconnexion de l'utilisateur
     * Appelle logout() puis redirige vers la page de connexion
     */
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // =====================================================================
    // RENDU DU COMPOSANT
    // =====================================================================

    return (
        <nav className="navbar">
            {/* ======================================= */}
            {/* LOGO / MARQUE */}
            {/* ======================================= */}
            <div className="navbar-brand">
                {/* Link vers la page d'accueil */}
                <Link to="/">📚 E-Learning</Link>
            </div>

            {/* ======================================= */}
            {/* MENU DE NAVIGATION */}
            {/* ======================================= */}
            <div className="navbar-menu">
                {/* Liens communs à tous les utilisateurs */}
                <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                    Accueil
                </NavLink>
                <NavLink to="/courses" className={({ isActive }) => isActive ? 'active' : ''}>
                    Cours
                </NavLink>

                {/* ======================================= */}
                {/* SECTION UTILISATEUR CONNECTÉ */}
                {/* ======================================= */}
                {isAuthenticated ? (
                    <>
                        {/* Lien vers le tableau de bord */}
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                            Tableau de bord
                        </NavLink>

                        {/* Lien Créer un cours - visible pour instructor et admin */}
                        {(user?.role === 'instructor' || user?.role === 'admin') && (
                            <NavLink to="/courses/create" className={({ isActive }) => isActive ? 'active' : ''}>
                                ➕ Créer un cours
                            </NavLink>
                        )}

                        {/* Lien Admin - visible uniquement pour les administrateurs */}
                        {user?.role === 'admin' && (
                            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                                ⚙️ Admin
                            </NavLink>
                        )}

                        {/* Lien vers le profil */}
                        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                            Profil
                        </NavLink>

                        {/* Informations utilisateur */}
                        <div className="user-info">
                            {/* Afficher le prénom ou l'email si le prénom n'existe pas */}
                            <span>{user?.profile?.firstName || user?.email}</span>
                            {/* Badge indiquant le rôle de l'utilisateur */}
                            <span className="role-badge">{user?.role}</span>
                        </div>

                        {/* Bouton de déconnexion */}
                        <button onClick={handleLogout} className="btn-logout">
                            Déconnexion
                        </button>
                    </>
                ) : (
                    /* ======================================= */
                    /* SECTION UTILISATEUR NON CONNECTÉ */
                    /* ======================================= */
                    <div className="auth-links">
                        <NavLink to="/login" className="btn-login">
                            Connexion
                        </NavLink>
                        <NavLink to="/register" className="btn-register">
                            Inscription
                        </NavLink>
                    </div>
                )}
            </div>
        </nav>
    );
};

// Exporter le composant
export default Navbar;
