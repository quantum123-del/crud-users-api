// filepath: frontend/src/services/api.js
import axios from 'axios';
import localDB from './localDB';

// URL de base de l'API backend - Détection automatique de l'IP
const getApiUrl = () => {
  // En développement, utiliser l'IP de la machine hôte
  if (import.meta.env.DEV) {
    // Essayer de détecter l'IP locale automatiquement
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Chercher l'IP locale
      return 'http://localhost:3000';
    }
    // Si accès réseau (autre appareil), utiliser l'IP de la machine
    return `http://${hostname}:3000`;
  }
  // En production
  return '/api';
};

const API_URL = getApiUrl();

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// État de la connexion backend
let backendAvailable = null;

// Vérifier si le backend est disponible
const checkBackendAvailability = async () => {
  if (backendAvailable !== null) {
    return backendAvailable;
  }

  try {
    await api.get('/');
    backendAvailable = true;
    console.log('✅ Backend disponible');
    return true;
  } catch (error) {
    backendAvailable = false;
    console.log('⚠️ Backend non disponible - Mode hors ligne activé');
    return false;
  }
};

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - déconnexion
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ FONCTIONS D'AUTHENTIFICATION ============

// Inscription
export const signup = async (email, password) => {
  try {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Erreur d\'inscription';
    throw new Error(message);
  }
};

// Connexion
export const signin = async (email, password) => {
  try {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Erreur de connexion';
    throw new Error(message);
  }
};

// Déconnexion
export const signout = async () => {
  try {
    await api.post('/auth/signout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la récupération de l\'utilisateur');
  }
};

// ============ FONCTIONS CRUD UTILISATEURS ============

// Obtenir tous les utilisateurs
export const getUsers = async () => {
  try {
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await api.get('/users');
        return response.data;
      } catch (error) {
        console.log('Erreur backend, utilisation de la base locale');
        const users = localDB.getAllUsers();
        return { 
          message: 'Données locales (hors ligne)', 
          data: users,
          offline: true 
        };
      }
    } else {
      // Backend non disponible - utiliser la base locale
      const users = localDB.getAllUsers();
      return { 
        message: 'Mode hors ligne - Données locales', 
        data: users,
        offline: true 
      };
    }
  } catch (error) {
    // Fallback ultime
    const users = localDB.getAllUsers();
    return { 
      message: 'Mode hors ligne', 
      data: users,
      offline: true 
    };
  }
};

// Obtenir un utilisateur par ID
export const getUserById = async (id) => {
  try {
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await api.get(`/users/${id}`);
        return response.data;
      } catch (error) {
        const user = localDB.getUserById(id);
        return { message: 'Données locales', data: user, offline: true };
      }
    } else {
      const user = localDB.getUserById(id);
      return { message: 'Mode hors ligne', data: user, offline: true };
    }
  } catch (error) {
    throw error;
  }
};

// Créer un nouvel utilisateur
export const createUser = async (userData) => {
  try {
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await api.post('/users', userData);
        return response.data;
      } catch (error) {
        // Si le backend échoue, créer localement
        const user = localDB.createUser(userData);
        return { 
          message: 'Créé localement (hors ligne)', 
          data: user,
          offline: true 
        };
      }
    } else {
      // Backend non disponible - créer localement
      const user = localDB.createUser(userData);
      return { 
        message: 'Mode hors ligne - Créé localement', 
        data: user,
        offline: true 
      };
    }
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (id, userData) => {
  try {
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
      } catch (error) {
        // Si le backend échoue, mettre à jour localement
        const user = localDB.updateUser(id, userData);
        return { 
          message: 'Mis à jour localement (hors ligne)', 
          data: user,
          offline: true 
        };
      }
    } else {
      // Backend non disponible - mettre à jour localement
      const user = localDB.updateUser(id, userData);
      return { 
        message: 'Mode hors ligne - Mis à jour localement', 
        data: user,
        offline: true 
      };
    }
  } catch (error) {
    throw error;
  }
};

// Supprimer un utilisateur
export const deleteUser = async (id) => {
  try {
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await api.delete(`/users/${id}`);
        return response.data;
      } catch (error) {
        // Si le backend échoue, supprimer localement
        localDB.deleteUser(id);
        return { 
          message: 'Supprimé localement (hors ligne)', 
          offline: true 
        };
      }
    } else {
      // Backend non disponible - supprimer localement
      localDB.deleteUser(id);
      return { 
        message: 'Mode hors ligne - Supprimé localement', 
        offline: true 
      };
    }
  } catch (error) {
    throw error;
  }
};

// ============ FONCTIONS UTILITAIRES ============

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Obtenir le token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Obtenir l'utilisateur depuis le localStorage
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Vérifier la disponibilité du backend
export const isBackendOnline = async () => {
  return await checkBackendAvailability();
};

// Réinitialiser l'état de disponibilité du backend
export const resetBackendStatus = () => {
  backendAvailable = null;
};

export default api;