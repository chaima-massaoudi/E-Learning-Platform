/**
 * =========================================================================
 * POINT D'ENTRÉE REACT (main.jsx)
 * =========================================================================
 * 
 * Ce fichier est le premier fichier JavaScript exécuté par l'application.
 * Il monte le composant React racine (App) dans le DOM HTML.
 * 
 * FONCTIONNEMENT:
 * 1. Récupère l'élément DOM avec l'id "root" (défini dans index.html)
 * 2. Crée une racine React avec createRoot (React 18)
 * 3. Rend le composant App dans cette racine
 * 
 * STRICTMODE:
 * StrictMode est un outil de développement qui:
 * - Détecte les effets de bord involontaires
 * - Avertit des API obsolètes
 * - Double les appels d'effets pour détecter les bugs
 * (N'affecte pas la production)
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// React - StrictMode pour le mode de développement strict
import { StrictMode } from 'react'

// React DOM - createRoot pour le nouveau mode de rendu concurrent (React 18)
import { createRoot } from 'react-dom/client'

// Styles globaux de l'application
import './index.css'

// Composant racine de l'application
import App from './App.jsx'

// =========================================================================
// MONTAGE DE L'APPLICATION
// =========================================================================

/**
 * Monter l'application React dans le DOM
 * 
 * 1. document.getElementById('root') récupère le div racine de index.html
 * 2. createRoot() crée une racine React pour le rendu concurrent
 * 3. render() affiche le composant App dans cette racine
 */
createRoot(document.getElementById('root')).render(
  // Mode strict pour détecter les problèmes potentiels
  <StrictMode>
    {/* Composant racine qui contient toute l'application */}
    <App />
  </StrictMode>,
)
