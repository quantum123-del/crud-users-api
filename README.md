# CRUD Users API - Application Autonome Complète

## 🎯 Vue d'ensemble

**CRUD Users API** est une application web full-stack pour la gestion des utilisateurs. Elle fonctionne de manière **entièrement autonome** - sans connexion Internet, sans serveur externe, avec un système d'authentification local.

### Caractéristiques principales
✅ **Connexion/Inscription** - Authentification locale avec JWT et bcrypt  
✅ **Gestion des utilisateurs** - CRUD complet (Créer, Lire, Mettre à jour, Supprimer)  
✅ **Mode hors ligne** - Fonctionne sans connexion réseau  
✅ **Persistance locale** - localStorage pour l'enregistrement des données  
✅ **Interface responsive** - Accessible sur desktop et mobile  
✅ **Sécurité** - Tokens JWT, mots de passe chiffrés

---

## 🏗️ Architecture

### Architecture générale
```
┌─────────────────────────────────────────────────────────┐
│                   CRUD USERS API                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (React + Vite)     │    Backend (Node.js)    │
│  ├── Pages                   │    ├── Controllers      │
│  ├── Components              │    ├── Routers          │
│  ├── Services                │    ├── Middlewares      │
│  └── LocalDB (localStorage)  │    └── Auth Service     │
│                              │                         │
│             ↓ API HTTP ↓                               │
│             (axios)                                    │
│                                                         │
│  Storage: localStorage (navigateur)                    │
│  ────────────────────────────────────────────────────── │
│  ✅ ENTIÈREMENT LOCAL - AUCUNE DÉPENDANCE EXTERNE     │
└─────────────────────────────────────────────────────────┘
```

### Technologies utilisées

| Technologie | Version | Rôle |
|---|---|---|
| **Node.js** | 18.x | Runtime backend |
| **Express** | 5.x | Framework web |
| **React** | 18.x | Framework frontend |
| **Vite** | 8.0 | Build tool frontend |
| **JWT** | latest | Authentification tokens |
| **bcrypt** | latest | Hachage des mots de passe |
| **axios** | latest | Client HTTP |
| **localStorage** | natif | Base de données locale |

---

## 🚀 Installation et Configuration

### Prérequis
- **Node.js 18.x** ou supérieur ([télécharger](https://nodejs.org))
- **Git** (optionnel)
- **Un navigateur moderne** (Chrome, Firefox, Safari, Edge)

### Étape 1 : Cloner le projet
```bash
# Via Git
git clone https://github.com/quantum123-del/crud-users-api.git
cd crud-users-api

# Ou télécharger en ZIP et extraire
```

### Étape 2 : Installer les dépendances backend
```bash
# Aller dans le répertoire backend
cd backend

# Installer les packages
npm install
```

### Étape 3 : Installer les dépendances frontend
```bash
# Aller dans le répertoire frontend
cd frontend

# Installer les packages
npm install
```

### Étape 4 : Configuration (optionnel - déjà configuré)
Les fichiers suivants sont déjà configurés :
- `.env` dans le backend (si nécessaire)
- Port backend : `3000`
- Port frontend : `5173`

---

## 📝 Comment lancer l'application

### Terminal 1 - Démarrer le backend
```bash
cd backend
npm start
```
✅ Le serveur backend s'exécute sur `http://localhost:3000`

### Terminal 2 - Démarrer le frontend
```bash
cd frontend
npm run dev
```
✅ L'application web s'exécute sur `http://localhost:5173`

### Accès à l'application
**URL d'accès** : http://localhost:5173

---

## 📱 Fonctionnalités et utilisation

### 1️⃣ Page de connexion (`/login`)
```
Email:    utilisateur@email.com
Mot de passe: monMotDePasse123
```
- Connexion locale avec email et mot de passe
- En cas d'erreur, vérifiez que vous avez d'abord créé un compte

### 2️⃣ Page d'inscription (`/register`)
```
Email:                  nouveau@email.com
Mot de passe:          Securite123
Confirmer mot de passe: Securite123
```
- Le mot de passe doit contenir au minimum 6 caractères
- L'email doit être unique
- Après inscription, vous êtes redirigé vers la page de connexion

### 3️⃣ Tableau de bord (`/dashboard`)
**Fonctionnalités** :
- 📊 Voir tous les utilisateurs dans un tableau
- ➕ Ajouter un nouvel utilisateur
- ✏️ Modifier un utilisateur existant
- 🗑️ Supprimer un utilisateur

**Champs utilisateur** :
| Champ | Type | Exemple |
|---|---|---|
| Âge | Nombre | 25 |
| Taille | Décimal (m) | 1.75 |
| Poids | Décimal (kg) | 70.5 |
| Sexe | M ou F | M |

---

## 🔐 Système d'authentification

### Flux d'authentification

```
1. Inscription (signup)
   Email + Password → Validation → Hashage bcrypt → localStorage
   ↓
   Token JWT généré → Stocké dans localStorage
   ↓
   Redirection vers Dashboard

2. Connexion (signin)
   Email + Password → Vérification → Comparaison avec hashage bcrypt
   ↓
   Token JWT généré → Stocké dans localStorage
   ↓
   Accès au Dashboard (protégé)

3. Déconnexion (signout)
   Suppression du token → localStorage effacé → Redirection vers login
```

### Sécurité implémentée
✅ Mots de passe hachés avec **bcrypt**  
✅ Tokens JWT avec signature  
✅ Routes protégées avec middleware d'authentification  
✅ Pas de mots de passe stockés en clair  
✅ Tokens expirables (configurable)

---

## 💾 Base de données locale

### Comment fonctionne la persistance

L'application utilise **localStorage** du navigateur pour enregistrer :

```javascript
// Clé 1 : Utilisateurs
{
  "crud_app_users": [
    {
      "id": 1,
      "age": 25,
      "taille": 1.75,
      "sexe": "M",
      "poids": 70,
      "created_at": "2026-04-27T12:34:56"
    }
    // ... autres utilisateurs
  ]
}

// Clé 2 : Compteur d'ID
{
  "crud_app_user_id_counter": 4
}

// Clé 3 : Token JWT
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

// Clé 4 : Utilisateur connecté
{
  "user": {
    "id": 1,
    "email": "utilisateur@email.com"
  }
}
```

### Visualiser les données stockées
1. Ouvrir DevTools du navigateur (F12)
2. Aller dans l'onglet **Application** → **Storage** → **localStorage**
3. Les clés commençant par `crud_app_` contiennent vos données

### Exporter/Importer les données
```javascript
// Dans la console du navigateur :

// Exporter
const dataExport = localStorage.getItem('crud_app_users');
console.log(dataExport); // Copier le JSON

// Importer
localStorage.setItem('crud_app_users', '[...]'); // Coller le JSON
```

---

## 🌐 Mode hors ligne (Offline-first)

### Fonctionnement

L'application détecte automatiquement si le backend est disponible :

```
┌─────────────────────────────────────────┐
│ Tentative d'accès au backend            │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Backend disponible → Utiliser API  │
│  ❌ Backend indisponible → Fallback    │
│                            localStorage │
│                                         │
│  Les opérations (CRUD) fonctionnent    │
│  identiquement dans les deux modes      │
└─────────────────────────────────────────┘
```

### Indicateurs à l'écran
- **Mode en ligne** : Affichage normal
- **Mode hors ligne** : Message "Données locales (hors ligne)"

### Synchronisation
⚠️ **Note importante** : Actuellement, les données créées en mode hors ligne restent locales. Pour une synchronisation automatique en production, il faudrait configurer IndexedDB + Service Workers.

---

## 📊 API Endpoints

### Authentification

#### POST `/auth/signup`
Créer un nouveau compte
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@email.com",
    "password": "Securite123"
  }'
```
**Réponse** :
```json
{
  "message": "Inscription réussie",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 5,
    "email": "nouveau@email.com",
    "created_at": "2026-04-27T12:34:56"
  }
}
```

#### POST `/auth/signin`
Se connecter
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "utilisateur@email.com",
    "password": "monMotDePasse123"
  }'
```
**Réponse** :
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "utilisateur@email.com"
  }
}
```

#### GET `/auth/me`
Obtenir l'utilisateur connecté
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```
**Réponse** :
```json
{
  "id": 1,
  "email": "utilisateur@email.com"
}
```

### Gestion des utilisateurs

#### GET `/users`
Obtenir tous les utilisateurs
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer TOKEN"
```

#### POST `/users`
Créer un utilisateur
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 25,
    "taille": 1.75,
    "sexe": "M",
    "poids": 70
  }'
```

#### PUT `/users/:id`
Mettre à jour un utilisateur
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 26,
    "taille": 1.75,
    "sexe": "M",
    "poids": 71
  }'
```

#### DELETE `/users/:id`
Supprimer un utilisateur
```bash
curl -X DELETE http://localhost:3000/users/1 \
  -H "Authorization: Bearer TOKEN"
```

---

## 📂 Structure des fichiers

```
crud-users-api/
│
├── backend/
│   ├── server.js                 # Point d'entrée du serveur
│   ├── package.json              # Dépendances backend
│   ├── config/
│   │   └── supabase.js           # Configuration (non utilisée)
│   ├── routers/
│   │   └── authRouter.js         # Routes d'authentification
│   ├── controllers/
│   │   └── usersController.js    # Logique CRUD
│   ├── middlewares/
│   │   └── authMiddleware.js     # Vérification JWT
│   └── services/
│       └── (services utilitaires)
│
├── frontend/
│   ├── package.json              # Dépendances frontend
│   ├── vite.config.js            # Configuration Vite
│   ├── src/
│   │   ├── App.jsx               # Router principal
│   │   ├── App.css               # Styles globaux
│   │   ├── main.jsx              # Point d'entrée React
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Page de connexion
│   │   │   ├── Register.jsx      # Page d'inscription
│   │   │   └── Dashboard.jsx     # Tableau de bord
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx # Route protégée
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # État global auth
│   │   └── services/
│   │       ├── api.js            # Client HTTP + fallback
│   │       └── localDB.js        # Base de données locale
│   └── index.html                # HTML racine
│
├── README.md                     # Ce fichier
└── package.json                  # Configuration générale
```

---

## 🔧 Configuration avancée

### Variables d'environnement (optionnel)

Créer un fichier `.env` dans le backend si nécessaire :
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=votre_secret_jwt_tres_securise

# Supabase (optionnel, non utilisé dans le mode autonome)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

### Changer le port du backend
Éditer `backend/server.js` :
```javascript
const PORT = process.env.PORT || 3000; // Changer ici
```

### Changer le port du frontend
Éditer `frontend/vite.config.js` :
```javascript
export default {
  server: {
    port: 5173 // Changer ici
  }
}
```

---

## ⚠️ Dépannage

### Erreur : "Backend non disponible"
**Cause** : Le serveur Node.js n'est pas démarré  
**Solution** : Assurez-vous que `npm start` s'exécute dans le terminal du backend

### Erreur : "Port 3000 déjà utilisé"
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess

# Linux/Mac
lsof -i :3000
```

### Erreur : "localStorage plein"
**Cause** : Navigateur manque d'espace mémoire  
**Solution** :
```javascript
// Dans la console :
localStorage.clear(); // Réinitialiser
```

### Erreur : "Token expiré"
**Solution** : Se reconnecter pour obtenir un nouveau token

### Les données ne se sauvegardent pas
**Vérifier** : 
1. Que le localStorage est activé dans le navigateur
2. DevTools → Application → Storage → localStorage

---

## 🚀 Déploiement (optionnel)

### Déployer le frontend (Vercel/Netlify)
```bash
# Build optimisé
npm run build

# Fichiers à déployer : frontend/dist/
```

### Déployer le backend (Heroku/Railway)
```bash
# À partir du répertoire backend
npm start

# Configurer le port : PORT=process.env.PORT
```

**⚠️ Important** : Pour la production, remplacer localStorage par une véritable base de données (PostgreSQL, MongoDB, etc.)

---

## 📖 Guide du code

### Flux d'authentification dans le code

**1. Inscription (Frontend)**
```javascript
// src/pages/Register.jsx
const handleSubmit = async (e) => {
  const result = await signup(email, password); // Appel API
  localStorage.setItem('token', result.token);  // Stockage du token
};
```

**2. Inscription (Backend)**
```javascript
// backend/routers/authRouter.js - POST /auth/signup
const { email, password } = req.body;
const hashedPassword = await bcrypt.hash(password, 10); // Hashage
const token = jwt.sign({ email }, JWT_SECRET);         // Token JWT
res.json({ token, user: { email } });
```

**3. Middleware de vérification (Backend)**
```javascript
// backend/middlewares/authMiddleware.js
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, JWT_SECRET);  // Vérification
req.userId = decoded.email;  // Utilisateur authentifié
next();
```

### Flux CRUD pour les utilisateurs

**1. Créer (Frontend)**
```javascript
// src/pages/Dashboard.jsx
const userData = { age: 25, taille: 1.75, sexe: 'M', poids: 70 };
const result = await createUser(userData);  // Service API
```

**2. Créer (Backend)**
```javascript
// backend/controllers/usersController.js
const newUser = {
  age: userData.age,
  taille: userData.taille,
  sexe: userData.sexe,
  poids: userData.poids,
  created_at: new Date().toISOString()
};
// Stockage en localStorage (côté frontend via API)
```

**3. Fallback hors ligne (Frontend)**
```javascript
// src/services/api.js
try {
  response = await api.post('/users', userData);  // Essayer backend
} catch (error) {
  user = localDB.createUser(userData);  // Fallback localStorage
}
```

---

## 🔒 Considérations de sécurité

### ✅ Ce qui est sécurisé
- ✅ Mots de passe hachés avec bcrypt (non reversible)
- ✅ Tokens JWT avec signature (forgerie impossible)
- ✅ Routes protégées avec middleware d'authentification
- ✅ Validation des emails et mots de passe
- ✅ localStorage du navigateur (sandboxé par domaine)

### ⚠️ Limitations du développement
- ⚠️ localStorage effacé si navigateur nettoie les données
- ⚠️ Mode hors ligne crée des données non synchronisées
- ⚠️ Secret JWT stocké en clair (à mettre dans .env en production)
- ⚠️ Pas de HTTPS (à implémenter en production)

### 🔐 Recommandations pour la production
1. Remplacer localStorage par une vraie base de données
2. Configurer HTTPS/TLS
3. Implémenter CSRF protection
4. Ajouter rate limiting sur les endpoints d'auth
5. Utiliser des variables d'environnement sécurisées

---

## 📞 Support et contributions

### Signaler un problème
Créer une issue sur : https://github.com/quantum123-del/crud-users-api/issues

### Contributions
Les contributions sont bienvenues ! Fork le projet et créez une pull request.

### Auteur
Développé comme application d'apprentissage autonome pour la gestion des utilisateurs.

---

## 📄 Licence

Ce projet est open-source. Libre d'utilisation pour l'apprentissage et les projets personnels.

---

## 🎓 Ressources d'apprentissage

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [JWT Explication](https://jwt.io)
- [localStorage MDN](https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage)

---

**Version** : 1.0.0  
**Date de création** : Avril 2026  
**Statut** : Production-ready (mode autonome)