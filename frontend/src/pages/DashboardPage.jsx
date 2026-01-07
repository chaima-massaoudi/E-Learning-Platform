import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, coursesAPI } from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const meResponse = await authAPI.getMe();
            setEnrolledCourses(meResponse.data.enrolledCourses || []);

            if (user?.role === 'instructor') {
                const coursesResponse = await coursesAPI.getAll();
                const instructorCourses = coursesResponse.data.filter(
                    c => c.instructor?._id === user._id || c.instructor === user._id
                );
                setMyCourses(instructorCourses);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Bonjour, {user?.profile?.firstName || user?.email} 👋</h1>
                <p>Bienvenue sur votre tableau de bord</p>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <span className="stat-icon">📚</span>
                    <div>
                        <h3>{enrolledCourses.length}</h3>
                        <p>Cours suivis</p>
                    </div>
                </div>
                {user?.role === 'instructor' && (
                    <div className="stat-card">
                        <span className="stat-icon">🎓</span>
                        <div>
                            <h3>{myCourses.length}</h3>
                            <p>Cours créés</p>
                        </div>
                    </div>
                )}
                <div className="stat-card">
                    <span className="stat-icon">👤</span>
                    <div>
                        <h3 className="capitalize">{user?.role}</h3>
                        <p>Votre rôle</p>
                    </div>
                </div>
            </div>

            <section className="dashboard-section">
                <div className="section-header">
                    <h2>Mes cours</h2>
                    <Link to="/courses">Voir tous les cours</Link>
                </div>

                {enrolledCourses.length === 0 ? (
                    <div className="empty-state">
                        <p>Vous n'êtes inscrit à aucun cours</p>
                        <Link to="/courses" className="btn-primary">Explorer les cours</Link>
                    </div>
                ) : (
                    <div className="courses-list">
                        {enrolledCourses.map(course => (
                            <Link to={`/courses/${course._id}`} key={course._id} className="course-item">
                                <span className="course-emoji">📖</span>
                                <div>
                                    <h4>{course.title}</h4>
                                    <p>{course.level}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {user?.role === 'instructor' && (
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Mes cours créés</h2>
                    </div>

                    {myCourses.length === 0 ? (
                        <div className="empty-state">
                            <p>Vous n'avez pas encore créé de cours</p>
                        </div>
                    ) : (
                        <div className="courses-list">
                            {myCourses.map(course => (
                                <Link to={`/courses/${course._id}`} key={course._id} className="course-item">
                                    <span className="course-emoji">🎯</span>
                                    <div>
                                        <h4>{course.title}</h4>
                                        <p>{course.enrolledStudents?.length || 0} étudiants</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default DashboardPage;
