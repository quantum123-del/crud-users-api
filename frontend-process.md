# Processus d'Externalisation - Frontend pour l'API de Collecte de Données

## 📋 Contexte

Ce document décrit le processus de création d'un frontend pour consommer l'API REST de collecte de données utilisateurs développée précédemment.

## 🎯 Objectifs du Frontend

1. **Interface utilisateur** pour visualiser les données
2. **Formulaire d'inscription/connexion** 
3. **Tableau de bord** pour gérer les utilisateurs
4. **Graphiques et statistiques** (optionnel)

## 🛠️ Choix Technologiques Recommandés

### Option 1 : React + Vite
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom
```

### Option 2 : Vue.js
```bash
npm create vue@latest frontend
cd frontend
npm install
```

### Option 3 : Vanilla JavaScript
- Plus léger, moins de dépendances
- Idéal pour un apprentissage progressif

## 📁 Structure du Projet Frontend

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── styles.css
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── UserList.js
│   │   ├── UserForm.js
│   │   └── ProtectedRoute.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   └── Users.js
│   ├── services/
│   │   ├── api.js      # Configuration API
│   │   └── auth.js     # Gestion authentification
│   ├── App.js
│   └── main.js
├── package.json
└── vite.config.js
```

## 🔌 Configuration de l'API

### src/services/api.js
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 🔐 Gestion de l'Authentification

### src/services/auth.js
```javascript
import api from './api';

export const authService = {
  // Inscription
  async signup(email, password) {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  },

  // Connexion
  async signin(email, password) {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.session) {
      localStorage.setItem('token', response.data.session.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Déconnexion
  async signout() {
    await api.post('/auth/signout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Vérifier si connecté
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
```

## 📝 Pages à Implémenter

### 1. Page de Connexion (Login)
- Formulaire avec email et mot de passe
- Lien vers la page d'inscription
- Gestion des erreurs de connexion

### 2. Page d'Inscription (Register)
- Formulaire avec email, mot de passe et confirmation
- Validation des champs
- Redirection après inscription réussie

### 3. Tableau de Bord (Dashboard)
- Affichage des statistiques
- Liste des utilisateurs récents
- Boutons d'action rapides

### 4. Gestion des Utilisateurs (Users)
- Tableau avec tous les utilisateurs
- Filtre par âge
- Boutons modifier et supprimer
- Formulaire pour ajouter un nouvel utilisateur

## 🔄 Flux Utilisateur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│  Dashboard  │────▶│   Users     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Register   │     │    API      │     │    API      │
└─────────────┘     │  /users     │     │  /users     │
                    └─────────────┘     └─────────────┘
```

## 🚀 Étapes de Développement

### Étape 1 : Configuration Initiale
1. Créer le projet avec Vite ou Vue CLI
2. Installer les dépendances nécessaires
3. Configurer le routing

### Étape 2 : Services API
1. Créer le client API avec axios
2. Implémenter les fonctions d'authentification
3. Tester les appels API

### Étape 3 : Pages d'Authentification
1. Créer la page de connexion
2. Créer la page d'inscription
3. Gérer le stockage du token

### Étape 4 : Pages Protégées
1. Créer le layout avec navigation
2. Implémenter le dashboard
3. Créer la liste des utilisateurs

### Étape 5 : Fonctionnalités CRUD
1. Afficher la liste des utilisateurs
2. Ajouter un nouvel utilisateur
3. Modifier un utilisateur existant
4. Supprimer un utilisateur

### Étape 6 : Améliorations
1. Ajouter des messages de confirmation
2. Gérer les erreurs
3. Ajouter des animations
4. Rendre le design responsive

## 📚 Ressources Utiles

### Documentation
- [React](https://react.dev/)
- [Vue.js](https://vuejs.org/)
- [Axios](https://axios-http.com/)
- [Vite](https://vitejs.dev/)

### Tutoriels
- Tutoriel React pour débutants
- Gestion d'état avec React Context
- Authentification JWT

## ⚠️ Points d'Attention

1. **Sécurité** : Ne jamais stocker le mot de passe en clair
2. **Token** : Gérer l'expiration du token JWT
3. **Validation** : Valider les données côté client et serveur
4. **UX** : Ajouter des indicateurs de chargement
5. **Erreurs** : Afficher des messages d'erreur clairs

## 📞 Support

Pour toute question sur le développement du frontend, n'hésitez pas à me contacter.

---

**Date de création** : 24 Avril 2026
**Dernière mise à jour** : 24 Avril 2026