/**
 * =========================================================================
 * COMPOSANT COURSECARD (Carte de Cours)
 * =========================================================================
 * 
 * Ce composant affiche une carte de cours réutilisable.
 * Il est utilisé dans les listes de cours pour présenter chaque cours.
 * 
 * INFORMATIONS AFFICHÉES:
 * - Image de couverture (ou placeholder)
 * - Niveau de difficulté (badge)
 * - Titre du cours
 * - Description tronquée (100 caractères)
 * - Prix (ou "Gratuit")
 * - Note moyenne
 * - Durée en heures
 * - Nombre d'étudiants inscrits
 * 
 * INTERACTION:
 * La carte entière est cliquable et mène à la page de détail du cours
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// React Router - Pour faire de la carte un lien cliquable
import { Link } from 'react-router-dom';

// Styles du composant
import './CourseCard.css';

// =========================================================================
// COMPOSANT COURSECARD
// =========================================================================

/**
 * Composant CourseCard - Affiche une carte de cours
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.course - L'objet cours à afficher
 * @param {string} props.course._id - ID unique du cours
 * @param {string} props.course.title - Titre du cours
 * @param {string} props.course.description - Description du cours
 * @param {number} props.course.price - Prix du cours en euros
 * @param {string} props.course.image - URL de l'image de couverture
 * @param {string} props.course.level - Niveau (débutant, intermédiaire, avancé)
 * @param {number} props.course.duration - Durée en heures
 * @param {number} props.course.averageRating - Note moyenne (0-5)
 * @param {Array} props.course.enrolledStudents - Liste des étudiants inscrits
 */
const CourseCard = ({ course }) => {
    return (
        // La carte entière est un lien vers la page de détail
        <Link to={`/courses/${course._id}`} className="course-card">
            {/* ======================================= */}
            {/* SECTION IMAGE */}
            {/* ======================================= */}
            <div className="course-image">
                {/* Afficher l'image si elle existe, sinon un placeholder */}
                {course.image ? (
                    <img src={course.image} alt={course.title} />
                ) : (
                    // Placeholder avec emoji livre
                    <div className="placeholder-image">📚</div>
                )}

                {/* Badge de niveau affiché sur l'image */}
                <span className="course-level">{course.level}</span>
            </div>

            {/* ======================================= */}
            {/* SECTION CONTENU */}
            {/* ======================================= */}
            <div className="course-content">
                {/* Titre du cours */}
                <h3>{course.title}</h3>

                {/* Description tronquée à 100 caractères */}
                <p className="course-description">
                    {course.description?.substring(0, 100)}...
                </p>

                {/* Métadonnées: Prix et Note */}
                <div className="course-meta">
                    {/* Prix - "Gratuit" si 0, sinon afficher le montant */}
                    <span className="course-price">
                        {course.price === 0 ? 'Gratuit' : `${course.price} €`}
                    </span>

                    {/* Note moyenne avec étoile */}
                    <span className="course-rating">
                        ⭐ {course.averageRating || '0'}
                    </span>
                </div>

                {/* Pied de carte: Durée et Nombre d'étudiants */}
                <div className="course-footer">
                    {/* Durée en heures */}
                    <span className="course-duration">⏱ {course.duration}h</span>

                    {/* Nombre d'étudiants inscrits */}
                    <span className="course-students">
                        👥 {course.enrolledStudents?.length || 0} étudiants
                    </span>
                </div>
            </div>
        </Link>
    );
};

// Exporter le composant
export default CourseCard;
