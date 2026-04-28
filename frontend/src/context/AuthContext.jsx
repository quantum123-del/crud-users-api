// filepath: frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signin as apiSignin, 
  signup as apiSignup, 
  signout as apiSignout,
  getCurrentUser,
  isAuthenticated as checkAuth,
  getStoredUser
} from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
      
      try {
        if (checkAuth()) {
          const userData = await getCurrentUser();
          setUser(userData.user);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification auth:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Connexion
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await apiSignin(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur de connexion';
      setError(message);
      throw new Error(message);
    }
  };

  // Inscription
  const register = async (email, password) => {
    setError(null);
    try {
      const data = await apiSignup(email, password);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || "Erreur d'inscription";
      setError(message);
      throw new Error(message);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await apiSignout();
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // Vérifier si connecté
  const isAuthenticated = () => {
    return checkAuth() && user !== null;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;