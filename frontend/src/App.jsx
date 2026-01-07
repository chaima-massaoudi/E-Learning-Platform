/**
 * =========================================================================
 * APPLICATION PRINCIPALE (App.jsx)
 * =========================================================================
 * 
 * Ce fichier est le composant racine de l'application React.
 * Il configure le routage et la gestion de l'état d'authentification.
 * 
 * STRUCTURE:
 * - AuthProvider: Contexte d'authentification global
 * - BrowserRouter: Routeur pour la navigation
 * - Navbar: Barre de navigation persistante
 * - Routes: Définition des pages et leur accessibilité
 * 
 * TYPES DE ROUTES:
 * - Routes publiques: Accessibles par tous
 * - Routes protégées: Nécessitent une authentification
 * - Routes par rôle: Nécessitent un rôle spécifique
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// React Router - Navigation côté client
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Contexte d'authentification
import { AuthProvider } from './context/AuthContext';

// Composants réutilisables
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages de l'application
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreateCoursePage from './pages/CreateCoursePage';
import AdminPage from './pages/AdminPage';

// Styles globaux de l'application
import './App.css';

// =========================================================================
// COMPOSANT PRINCIPAL
// =========================================================================

/**
 * Composant App - Point d'entrée de l'application React
 * 
 * Hiérarchie des composants:
 * AuthProvider > BrowserRouter > Navbar + Routes
 * 
 * AuthProvider doit englober tout pour que useAuth() fonctionne partout
 */
function App() {
  return (
    // Fournisseur du contexte d'authentification
    // Donne accès à user, login, logout, etc. dans toute l'application
    <AuthProvider>
      {/* Routeur pour gérer la navigation sans rechargement de page */}
      <BrowserRouter>
        <div className="app">
          {/* Barre de navigation - visible sur toutes les pages */}
          <Navbar />

          {/* Contenu principal qui change selon la route */}
          <main className="main-content">
            <Routes>
              {/* ============================================== */}
              {/* ROUTES PUBLIQUES */}
              {/* Accessibles par tous les visiteurs */}
              {/* ============================================== */}

              {/* Page d'accueil */}
              <Route path="/" element={<HomePage />} />

              {/* Pages d'authentification */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Catalogue des cours */}
              <Route path="/courses" element={<CoursesPage />} />

              {/* Détail d'un cours (le :id est un paramètre dynamique) */}
              <Route path="/courses/:id" element={<CourseDetailPage />} />

              {/* ============================================== */}
              {/* ROUTES PROTÉGÉES */}
              {/* Nécessitent une authentification */}
              {/* ============================================== */}

              {/* Tableau de bord - tous les utilisateurs connectés */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Page de profil - tous les utilisateurs connectés */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* ============================================== */}
              {/* ROUTES INSTRUCTEUR */}
              {/* Nécessitent le rôle instructor ou admin */}
              {/* ============================================== */}

              <Route
                path="/courses/create"
                element={
                  // roles={['instructor', 'admin']} = seuls ces rôles peuvent accéder
                  <ProtectedRoute roles={['instructor', 'admin']}>
                    <CreateCoursePage />
                  </ProtectedRoute>
                }
              />

              {/* ============================================== */}
              {/* ROUTES ADMIN */}
              {/* Nécessitent le rôle admin uniquement */}
              {/* ============================================== */}

              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Exporter le composant pour l'utiliser dans main.jsx
export default App;
