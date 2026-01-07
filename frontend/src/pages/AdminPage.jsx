import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { categoriesAPI } from '../services/api';
import api from '../services/api';
import './AdminPage.css';

const AdminPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, categoriesRes] = await Promise.all([
                api.get('/users'),
                categoriesAPI.getAll(),
            ]);
            setUsers(usersRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await categoriesAPI.create(newCategory);
            setNewCategory({ name: '', description: '' });
            setMessage({ type: 'success', text: 'Catégorie créée avec succès!' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie?')) return;
        try {
            await categoriesAPI.delete(id);
            setMessage({ type: 'success', text: 'Catégorie supprimée!' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return;
        try {
            await api.delete(`/users/${id}`);
            setMessage({ type: 'success', text: 'Utilisateur supprimé!' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="access-denied">
                <h2>🔒 Accès Administrateur Requis</h2>
                <p>Cette page est réservée aux administrateurs.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>⚙️ Panneau d'Administration</h1>
                <p>Gérez les utilisateurs et les catégories</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <div className="admin-tabs">
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Utilisateurs ({users.length})
                </button>
                <button
                    className={activeTab === 'categories' ? 'active' : ''}
                    onClick={() => setActiveTab('categories')}
                >
                    📁 Catégories ({categories.length})
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'users' && (
                    <div className="users-section">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Nom</th>
                                    <th>Rôle</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td>{u.email}</td>
                                        <td>{u.profile?.firstName} {u.profile?.lastName}</td>
                                        <td>
                                            <span className={`role-badge role-${u.role}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            {u._id !== user._id && (
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="btn-delete"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="categories-section">
                        <form onSubmit={handleCreateCategory} className="category-form">
                            <h3>Ajouter une catégorie</h3>
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="Nom de la catégorie"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                />
                                <button type="submit">+ Ajouter</button>
                            </div>
                        </form>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Description</th>
                                    <th>Cours</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat._id}>
                                        <td><strong>{cat.name}</strong></td>
                                        <td>{cat.description || '-'}</td>
                                        <td>{cat.courses?.length || 0}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteCategory(cat._id)}
                                                className="btn-delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
