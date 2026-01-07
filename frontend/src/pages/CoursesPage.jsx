import { useState, useEffect } from 'react';
import { coursesAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import './CoursesPage.css';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await coursesAPI.getAll();
            setCourses(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des cours');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des cours...</p>
            </div>
        );
    }

    return (
        <div className="courses-page">
            <div className="page-header">
                <h1>Tous les cours</h1>
                <p>Découvrez notre catalogue de cours et commencez à apprendre</p>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Rechercher un cours..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {filteredCourses.length === 0 ? (
                <div className="empty-state">
                    <p>😕 Aucun cours trouvé</p>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')}>Effacer la recherche</button>
                    )}
                </div>
            ) : (
                <div className="courses-grid">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoursesPage;
