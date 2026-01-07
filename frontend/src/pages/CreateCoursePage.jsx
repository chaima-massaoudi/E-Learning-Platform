import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, categoriesAPI } from '../services/api';
import './CreateCoursePage.css';

const CreateCoursePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        level: 'débutant',
        duration: 0,
        image: '',
        categories: [],
        isPublished: false,
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleCategoryChange = (categoryId) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter((id) => id !== categoryId)
                : [...prev.categories, categoryId],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await coursesAPI.create({
                ...formData,
                price: Number(formData.price),
                duration: Number(formData.duration),
            });
            setSuccess('Cours créé avec succès!');
            setTimeout(() => {
                navigate(`/courses/${response.data._id}`);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création du cours');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'instructor' && user?.role !== 'admin') {
        return (
            <div className="access-denied">
                <h2>🚫 Accès refusé</h2>
                <p>Vous devez être instructeur pour créer des cours.</p>
            </div>
        );
    }

    return (
        <div className="create-course-page">
            <div className="page-header">
                <h1>📚 Créer un nouveau cours</h1>
                <p>Partagez vos connaissances avec le monde</p>
            </div>

            <form onSubmit={handleSubmit} className="course-form">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="form-section">
                    <h2>Informations générales</h2>

                    <div className="form-group">
                        <label htmlFor="title">Titre du cours *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ex: Introduction à React.js"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Décrivez votre cours en détail..."
                            rows="6"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="price">Prix (€)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="duration">Durée (heures)</label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="level">Niveau</label>
                            <select
                                id="level"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                            >
                                <option value="débutant">Débutant</option>
                                <option value="intermédiaire">Intermédiaire</option>
                                <option value="avancé">Avancé</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">URL de l'image</label>
                        <input
                            type="url"
                            id="image"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Catégories</h2>
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <label key={category._id} className="category-checkbox">
                                <input
                                    type="checkbox"
                                    checked={formData.categories.includes(category._id)}
                                    onChange={() => handleCategoryChange(category._id)}
                                />
                                <span>{category.name}</span>
                            </label>
                        ))}
                        {categories.length === 0 && (
                            <p className="no-categories">Aucune catégorie disponible</p>
                        )}
                    </div>
                </div>

                <div className="form-section">
                    <h2>Publication</h2>
                    <label className="publish-checkbox">
                        <input
                            type="checkbox"
                            name="isPublished"
                            checked={formData.isPublished}
                            onChange={handleChange}
                        />
                        <span>Publier le cours immédiatement</span>
                    </label>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)} className="btn-cancel">
                        Annuler
                    </button>
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Création...' : 'Créer le cours'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCoursePage;
