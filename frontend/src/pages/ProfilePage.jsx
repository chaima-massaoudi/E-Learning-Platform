import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profilesAPI } from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user?._id) return;
        try {
            const response = await profilesAPI.get(user._id);
            setProfile(response.data);
            setFormData(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await profilesAPI.update(user._id, formData);
            setProfile(response.data);
            updateUser({ ...user, profile: response.data });
            setEditing(false);
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="avatar">
                    {profile?.avatar ? (
                        <img src={profile.avatar} alt="Avatar" />
                    ) : (
                        <span>👤</span>
                    )}
                </div>
                <div className="profile-info">
                    <h1>{profile?.firstName} {profile?.lastName}</h1>
                    <p>{user?.email}</p>
                    <span className="role-badge">{user?.role}</span>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <div className="profile-content">
                {editing ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Prénom</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nom</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio || ''}
                                onChange={handleChange}
                                rows="4"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Téléphone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Adresse</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={saving}>
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                                Annuler
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-details">
                        <div className="detail-item">
                            <label>Bio</label>
                            <p>{profile?.bio || 'Non renseigné'}</p>
                        </div>
                        <div className="detail-row">
                            <div className="detail-item">
                                <label>Téléphone</label>
                                <p>{profile?.phone || 'Non renseigné'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Adresse</label>
                                <p>{profile?.address || 'Non renseigné'}</p>
                            </div>
                        </div>
                        <button onClick={() => setEditing(true)} className="btn-edit">
                            Modifier le profil
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
