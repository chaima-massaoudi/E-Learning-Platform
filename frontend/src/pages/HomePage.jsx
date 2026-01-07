/**
 * =========================================================================
 * PAGE D'ACCUEIL (HomePage.jsx)
 * =========================================================================
 * 
 * Ce composant affiche la page d'accueil de la plateforme e-learning.
 * C'est la première page que les visiteurs voient en arrivant sur le site.
 * 
 * SECTIONS:
 * - Hero: Bannière principale avec slogan et appels à l'action
 * - Features: Présentation des avantages de la plateforme
 * - CTA: Section d'appel à l'action pour l'inscription
 * 
 * AFFICHAGE CONDITIONNEL:
 * - Visiteur non connecté: Boutons d'inscription et de découverte
 * - Utilisateur connecté: Bouton "Explorer les cours"
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// React Router - Composant de lien pour la navigation
import { Link } from 'react-router-dom';

// Hook d'authentification pour vérifier si l'utilisateur est connecté
import { useAuth } from '../context/AuthContext';

// Styles spécifiques à cette page
import './HomePage.css';

// =========================================================================
// COMPOSANT HOMEPAGE
// =========================================================================

/**
 * Composant HomePage - Page d'accueil de la plateforme
 * 
 * Cette page a pour objectifs de:
 * - Présenter la plateforme aux nouveaux visiteurs
 * - Inciter à l'inscription
 * - Mettre en valeur les fonctionnalités clés
 */
const HomePage = () => {
    // Récupérer l'état d'authentification
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="home-page">
            {/* ======================================= */}
            {/* SECTION HERO - Bannière principale */}
            {/* ======================================= */}
            <section className="hero">
                {/* Contenu textuel */}
                <div className="hero-content">
                    {/* Titre principal - Accroche marketing */}
                    <h1>Apprenez les compétences de demain</h1>

                    {/* Description de la plateforme */}
                    <p>
                        Découvrez des milliers de cours créés par des experts dans tous les domaines.
                        Commencez votre parcours d'apprentissage aujourd'hui.
                    </p>

                    {/* Boutons d'action - différents selon l'état de connexion */}
                    <div className="hero-buttons">
                        {isAuthenticated ? (
                            // Utilisateur connecté: un seul bouton vers les cours
                            <Link to="/courses" className="btn-primary">
                                Explorer les cours
                            </Link>
                        ) : (
                            // Visiteur: deux boutons - inscription et découverte
                            <>
                                <Link to="/register" className="btn-primary">
                                    Commencer gratuitement
                                </Link>
                                <Link to="/courses" className="btn-secondary">
                                    Voir les cours
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Illustration avec cartes flottantes animées */}
                <div className="hero-illustration">
                    <div className="floating-cards">
                        {/* Cartes représentant les catégories de cours */}
                        <div className="card">📊 Data Science</div>
                        <div className="card">💻 Développement Web</div>
                        <div className="card">🎨 Design UX/UI</div>
                        <div className="card">📱 Mobile Development</div>
                    </div>
                </div>
            </section>

            {/* ======================================= */}
            {/* SECTION FEATURES - Avantages */}
            {/* ======================================= */}
            <section className="features">
                <h2>Pourquoi nous choisir ?</h2>

                {/* Grille de cartes d'avantages */}
                <div className="features-grid">
                    {/* Avantage 1: Qualité */}
                    <div className="feature-card">
                        <span className="feature-icon">🎓</span>
                        <h3>Cours de qualité</h3>
                        <p>Des contenus créés par des experts du domaine</p>
                    </div>

                    {/* Avantage 2: Flexibilité */}
                    <div className="feature-card">
                        <span className="feature-icon">⏰</span>
                        <h3>Apprenez à votre rythme</h3>
                        <p>Accédez aux cours 24h/24, 7j/7</p>
                    </div>

                    {/* Avantage 3: Certification */}
                    <div className="feature-card">
                        <span className="feature-icon">📜</span>
                        <h3>Certificats</h3>
                        <p>Obtenez des certificats reconnus</p>
                    </div>

                    {/* Avantage 4: Communauté */}
                    <div className="feature-card">
                        <span className="feature-icon">💬</span>
                        <h3>Communauté</h3>
                        <p>Échangez avec d'autres apprenants</p>
                    </div>
                </div>
            </section>

            {/* ======================================= */}
            {/* SECTION CTA - Appel à l'action */}
            {/* ======================================= */}
            <section className="cta">
                <h2>Prêt à commencer ?</h2>
                <p>Rejoignez des milliers d'apprenants et développez vos compétences</p>

                {/* Bouton d'inscription - visible uniquement pour les visiteurs */}
                {!isAuthenticated && (
                    <Link to="/register" className="btn-primary btn-large">
                        S'inscrire maintenant
                    </Link>
                )}
            </section>
        </div>
    );
};

// Exporter le composant
export default HomePage;
