// filepath: frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form state - utiliser les noms de champs du backend
  const [formData, setFormData] = useState({
    age: '',
    taille: '',
    sexe: '',
    poids: ''
  });

  // Charger les utilisateurs
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data.data || data.users || []);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Ouvrir le modal pour ajouter
  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ age: '', taille: '', sexe: '', poids: '' });
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      age: user.age || '',
      taille: user.taille || '',
      sexe: user.sexe || '',
      poids: user.poids || ''
    });
    setShowModal(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const userData = {
        age: parseInt(formData.age) || null,
        taille: parseFloat(formData.taille) || null,
        poids: parseFloat(formData.poids) || null,
        sexe: formData.sexe
      };

      if (editingUser) {
        const response = await updateUser(editingUser.id, userData);
        setSuccess(response.message || 'Données modifiées avec succès!');
      } else {
        const response = await createUser(userData);
        setSuccess(response.message || 'Données enregistrées avec succès!');
      }

      setShowModal(false);
      loadUsers();
      
      // Masquer le message après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      return;
    }

    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Tableau de bord</h1>
        <div className="user-info">
          <span>Bienvenue, {user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary">
            Déconnexion
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="users-section">
          <div className="section-header">
            <h2>Gestion des utilisateurs</h2>
            <button onClick={handleAdd} className="btn-primary">
              + Ajouter un utilisateur
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {loading ? (
            <div className="loading">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>Aucun utilisateur trouvé. Ajoutez votre premier utilisateur!</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Âge</th>
                  <th>Taille (m)</th>
                  <th>Poids (kg)</th>
                  <th>Sexe</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.age}</td>
                    <td>{u.taille}</td>
                    <td>{u.poids}</td>
                    <td>{u.sexe}</td>
                    <td>
                      <button 
                        onClick={() => handleEdit(u)} 
                        className="btn-edit"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)} 
                        className="btn-delete"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal pour ajouter/modifier */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingUser ? 'Modifier' : 'Ajouter'} un utilisateur</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="age">Âge</label>
                <input
                  type="number"
                  id="age"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="taille">Taille (m)</label>
                <input
                  type="number"
                  id="taille"
                  step="0.01"
                  value={formData.taille}
                  onChange={(e) => setFormData({...formData, taille: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="poids">Poids (kg)</label>
                <input
                  type="number"
                  id="poids"
                  step="0.1"
                  value={formData.poids}
                  onChange={(e) => setFormData({...formData, poids: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="sexe">Sexe</label>
                <select
                  id="sexe"
                  value={formData.sexe}
                  onChange={(e) => setFormData({...formData, sexe: e.target.value})}
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin (M)</option>
                  <option value="F">Féminin (F)</option>
                </select>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;