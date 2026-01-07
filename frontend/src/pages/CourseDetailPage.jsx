import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, reviewsAPI } from '../services/api';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const response = await coursesAPI.getById(id);
            setCourse(response.data);
            if (user) {
                setIsEnrolled(
                    response.data.enrolledStudents?.some(s => s._id === user._id)
                );
            }
        } catch (err) {
            setError('Cours non trouvé');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            if (isEnrolled) {
                await coursesAPI.unenroll(id);
                setIsEnrolled(false);
            } else {
                await coursesAPI.enroll(id);
                setIsEnrolled(true);
            }
            fetchCourse();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
        } finally {
            setEnrolling(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await reviewsAPI.create({ ...reviewForm, courseId: id });
            setReviewForm({ rating: 5, comment: '' });
            fetchCourse();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    if (error || !course) {
        return (
            <div className="error-page">
                <h2>😕 {error || 'Cours non trouvé'}</h2>
                <button onClick={() => navigate('/courses')}>Retour aux cours</button>
            </div>
        );
    }

    return (
        <div className="course-detail-page">
            <div className="course-hero">
                <div className="course-hero-content">
                    <span className="course-level-badge">{course.level}</span>
                    <h1>{course.title}</h1>
                    <p className="course-instructor">
                        Par {course.instructor?.email || 'Instructeur'}
                    </p>
                    <div className="course-stats">
                        <span>⭐ {course.averageRating || '0'}</span>
                        <span>👥 {course.enrolledStudents?.length || 0} étudiants</span>
                        <span>⏱ {course.duration}h de contenu</span>
                    </div>
                    <div className="course-price-action">
                        <span className="price">
                            {course.price === 0 ? 'Gratuit' : `${course.price} €`}
                        </span>
                        <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className={isEnrolled ? 'btn-enrolled' : 'btn-enroll'}
                        >
                            {enrolling ? '...' : isEnrolled ? 'Se désinscrire' : 'S\'inscrire'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="course-content-wrapper">
                <div className="course-main">
                    <section className="section">
                        <h2>Description</h2>
                        <p>{course.description}</p>
                    </section>

                    <section className="section">
                        <h2>Catégories</h2>
                        <div className="categories-list">
                            {course.categories?.map(cat => (
                                <span key={cat._id} className="category-tag">{cat.name}</span>
                            ))}
                        </div>
                    </section>

                    <section className="section reviews-section">
                        <h2>Avis ({course.reviews?.length || 0})</h2>

                        {isAuthenticated && isEnrolled && (
                            <form onSubmit={handleReviewSubmit} className="review-form">
                                <div className="rating-input">
                                    <label>Note:</label>
                                    <select
                                        value={reviewForm.rating}
                                        onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                                    >
                                        {[5, 4, 3, 2, 1].map(n => (
                                            <option key={n} value={n}>{'⭐'.repeat(n)}</option>
                                        ))}
                                    </select>
                                </div>
                                <textarea
                                    placeholder="Votre avis..."
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    required
                                />
                                <button type="submit" disabled={submittingReview}>
                                    {submittingReview ? 'Envoi...' : 'Publier'}
                                </button>
                            </form>
                        )}

                        <div className="reviews-list">
                            {course.reviews?.map(review => (
                                <div key={review._id} className="review-card">
                                    <div className="review-header">
                                        <span className="review-author">{review.user?.email}</span>
                                        <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                                    </div>
                                    <p>{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
