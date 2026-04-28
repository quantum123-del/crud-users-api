# RAPPORT D'ARCHITECTURE - CRUD Users API

## 📋 Résumé exécutif

L'application **CRUD Users API** est une solution autonome et complète de gestion d'utilisateurs basée sur une architecture **full-stack moderne**. Elle combine un backend **Node.js/Express** avec un frontend **React/Vite**, utilisant l'authentification **JWT** et le **localStorage** comme base de données.

### Avantages principaux
✅ **Autonomie totale** - Pas de dépendances externes (Supabase non nécessaire)  
✅ **Mode hors ligne** - Fonctionne sans connexion Internet  
✅ **Sécurité** - Authentification JWT + bcrypt  
✅ **Facilité d'utilisation** - Installation en 3 étapes  
✅ **Scalabilité** - Prêt pour la production avec améliorations  

---

## 1️⃣ ARCHITECTURE GÉNÉRALE

### 1.1 Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CRUD USERS API                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (React + Vite)          BACKEND (Node.js + Express)  │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │  Pages (UI Layer)    │         │  Routes/API Endpoints│     │
│  │  ├─ Login            │         │  ├─ /auth/signup     │     │
│  │  ├─ Register         │  ←HTTP→ │  ├─ /auth/signin     │     │
│  │  └─ Dashboard        │  Axios  │  ├─ /users           │     │
│  │                      │         │  └─ /auth/me         │     │
│  ├──────────────────────┤         ├──────────────────────┤     │
│  │ Components (UI)      │         │ Middlewares          │     │
│  │ ├─ ProtectedRoute    │         │ ├─ authMiddleware    │     │
│  │ └─ Forms             │         │ └─ errorHandler      │     │
│  │                      │         │                      │     │
│  ├──────────────────────┤         ├──────────────────────┤     │
│  │ Services             │         │ Controllers          │     │
│  │ ├─ api.js (Axios)    │         │ ├─ usersController   │     │
│  │ └─ localDB.js        │         │ └─ authController    │     │
│  │                      │         │                      │     │
│  ├──────────────────────┤         ├──────────────────────┤     │
│  │ Context (State)      │         │ Auth Service         │     │
│  │ └─ AuthContext.jsx   │         │ ├─ JWT verification  │     │
│  │                      │         │ └─ bcrypt hashing    │     │
│  └──────────────────────┘         └──────────────────────┘     │
│           ↓                                 ↓                   │
│      localStorage                   In-memory users Map        │
│      (Navigateur)                    (Session)                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Flux de données

```
Utilisateur
    ↓
Interface (React)
    ↓
Service API (axios)
    ↓
[Backend disponible ?]
    ├→ OUI → Backend API → In-memory users Map
    └→ NON → localStorage (fallback)
    ↓
Réponse HTTP
    ↓
React Context (mise à jour état)
    ↓
Interface mise à jour
```

---

## 2️⃣ BACKEND (Node.js + Express)

### 2.1 Structure des fichiers backend

```
backend/
├── server.js                      # Point d'entrée principal
├── package.json                   # Dépendances NPM
├── config/
│   └── supabase.js                # Configuration Supabase (non utilisée)
├── routers/
│   └── authRouter.js              # Routes authentication
├── controllers/
│   └── usersController.js         # Logique métier CRUD
├── middlewares/
│   └── authMiddleware.js          # Vérification JWT
└── services/
    └── (services utilitaires)
```

### 2.2 Fichier principal : server.js

**Responsabilités** :
- Initialiser le serveur Express
- Configurer les middlewares globaux
- Enregistrer les routes
- Lancer le serveur sur le port 3000

**Code clé** :
```javascript
// Initialisation du serveur
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());  // Parser JSON
app.use(cors());          // CORS activé

// Routes
app.use('/auth', authRouter);     // Routes d'authentification
app.use('/users', usersRouter);   // Routes utilisateurs

// Démarrage
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
  console.log('Utilisation de l\'authentification locale');
});
```

### 2.3 Routeur d'authentification : authRouter.js

**Endpoints implémentés** :

#### **POST /auth/signup** - Créer un compte
```javascript
// Entrée
{
  "email": "utilisateur@email.com",
  "password": "Securite123"
}

// Processus
1. Validation email et mot de passe
2. Vérifier email unique
3. Hasher le mot de passe avec bcrypt (10 tours)
4. Créer l'utilisateur en mémoire (Map)
5. Générer JWT token
6. Retourner token + utilisateur

// Sortie
{
  "message": "Inscription réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "email": "utilisateur@email.com",
    "created_at": "2026-04-27T12:34:56"
  }
}
```

#### **POST /auth/signin** - Se connecter
```javascript
// Entrée
{
  "email": "utilisateur@email.com",
  "password": "Securite123"
}

// Processus
1. Chercher l'utilisateur par email
2. Comparer le mot de passe avec bcrypt.compare()
3. Si correct → Générer JWT token
4. Retourner token + utilisateur
5. Si incorrect → Erreur 401

// Sortie
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "utilisateur@email.com"
  }
}
```

#### **GET /auth/me** - Obtenir l'utilisateur connecté
```javascript
// Processus
1. Middleware authMiddleware vérifie le JWT
2. Décoder le JWT pour obtenir l'email
3. Retourner les données de l'utilisateur

// Sortie
{
  "id": 1,
  "email": "utilisateur@email.com"
}
```

#### **POST /auth/signout** - Se déconnecter
```javascript
// Processus
1. Simplement retourner un message de succès
2. Côté frontend : supprimer le token du localStorage

// Sortie
{
  "message": "Déconnexion réussie"
}
```

### 2.4 Middleware d'authentification : authMiddleware.js

**Fonction** : Protéger les routes qui nécessitent une authentification

**Code expliqué** :
```javascript
const authMiddleware = (req, res, next) => {
  // 1. Extraire le token du header
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];  // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    // 2. Vérifier la signature du JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded = { email: "user@email.com", iat: 1234567890 }
    
    // 3. Ajouter l'email à l'objet request
    req.userId = decoded.email;
    
    // 4. Passer au contrôleur
    next();
  } catch (error) {
    // Token invalide ou expiré
    return res.status(401).json({ error: 'Token invalide' });
  }
};
```

### 2.5 Contrôleur utilisateurs : usersController.js

**Responsabilités** : Logique CRUD pour les utilisateurs

#### **CREATE - Créer un utilisateur**
```javascript
// Entrée (depuis /users POST)
{
  "age": 25,
  "taille": 1.75,
  "sexe": "M",
  "poids": 70
}

// Code
const createUser = (userData) => {
  const newUser = {
    id: generateId(),                    // Auto-incrémenté
    age: userData.age,
    taille: userData.taille,
    sexe: userData.sexe,
    poids: userData.poids,
    created_at: new Date().toISOString() // Timestamp ISO 8601
  };
  
  usersMap.set(newUser.id, newUser);  // Stocker en mémoire
  return newUser;
};

// Sortie
{
  "message": "Utilisateur créé avec succès",
  "data": {
    "id": 5,
    "age": 25,
    "taille": 1.75,
    "sexe": "M",
    "poids": 70,
    "created_at": "2026-04-27T12:34:56"
  }
}
```

#### **READ - Lire les utilisateurs**
```javascript
// GET /users (tous)
const getAllUsers = () => {
  return Array.from(usersMap.values());  // Convertir Map en Array
};

// GET /users/:id (un seul)
const getUserById = (id) => {
  return usersMap.get(parseInt(id));
};
```

#### **UPDATE - Mettre à jour**
```javascript
// Code
const updateUser = (id, userData) => {
  const existingUser = usersMap.get(parseInt(id));
  
  if (!existingUser) {
    throw new Error('Utilisateur non trouvé');
  }
  
  // Fusionner les données
  const updatedUser = {
    ...existingUser,
    ...userData,
    id: parseInt(id)  // Préserver l'ID
  };
  
  usersMap.set(parseInt(id), updatedUser);
  return updatedUser;
};
```

#### **DELETE - Supprimer**
```javascript
// Code
const deleteUser = (id) => {
  const userId = parseInt(id);
  const exists = usersMap.has(userId);
  
  if (!exists) {
    throw new Error('Utilisateur non trouvé');
  }
  
  usersMap.delete(userId);
  return { message: 'Utilisateur supprimé' };
};
```

### 2.6 Stockage en mémoire

**Structure** :
```javascript
// Gestion des utilisateurs authentifiés (locaux)
const localUsersMap = new Map();
localUsersMap.set('email@example.com', {
  user: {
    id: 5,
    email: 'email@example.com',
    created_at: '2026-04-27T12:34:56'
  },
  password: '$2b$10$...'  // Hash bcrypt
});

// Gestion des utilisateurs CRUD
const usersMap = new Map();
usersMap.set(1, {
  id: 1,
  age: 25,
  taille: 1.75,
  sexe: 'M',
  poids: 70,
  created_at: '2026-04-27T12:34:56'
});
```

**Limitations** :
⚠️ Les données sont perdues au redémarrage du serveur  
⚠️ Aucune persistance sur disque  
✅ Suffisant pour le développement/test

---

## 3️⃣ FRONTEND (React + Vite)

### 3.1 Structure des fichiers frontend

```
frontend/
├── package.json           # Dépendances
├── vite.config.js         # Configuration build
├── index.html             # Point d'entrée HTML
├── src/
│   ├── main.jsx           # Bootstrap React
│   ├── App.jsx            # Router principal
│   ├── App.css            # Styles globaux
│   ├── pages/
│   │   ├── Login.jsx      # Page de connexion
│   │   ├── Register.jsx   # Page d'inscription
│   │   └── Dashboard.jsx  # Tableau de bord
│   ├── components/
│   │   └── ProtectedRoute.jsx  # Garde de route
│   ├── context/
│   │   └── AuthContext.jsx     # État global
│   └── services/
│       ├── api.js         # Client HTTP + fallback
│       └── localDB.js     # Base de données locale
```

### 3.2 Routeur principal : App.jsx

**Responsabilités** :
- Configurer les routes avec React Router
- Envelopper l'application dans le AuthProvider
- Définir les routes publiques et protégées

**Code** :
```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes protégées */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

**Routes** :
| Route | Accès | Component |
|---|---|---|
| `/login` | Public | Login.jsx |
| `/register` | Public | Register.jsx |
| `/dashboard` | Protégé | ProtectedRoute → Dashboard |
| `/` | - | Redirect → /dashboard |
| `*` | - | Redirect → /dashboard |

### 3.3 Context d'authentification : AuthContext.jsx

**Responsabilités** :
- Gérer l'état global de l'authentification
- Fournir les fonctions de login/logout
- Initialiser l'utilisateur depuis localStorage

**État** :
```javascript
{
  user: {           // Utilisateur connecté
    id: 1,
    email: 'user@email.com'
  } | null,
  
  loading: true,    // Chargement en cours
  
  error: '',        // Message d'erreur
}
```

**Fonctions fournies** :
```javascript
const {
  user,              // Utilisateur connecté
  loading,           // État de chargement
  error,             // Message d'erreur
  login,             // Fonction de connexion
  register,          // Fonction d'inscription
  logout,            // Fonction de déconnexion
  isAuthenticated,   // Booléen
  clearError         // Effacer l'erreur
} = useAuth();
```

**Code clé** :
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // À l'initialisation, charger l'utilisateur depuis localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    const result = await signin(email, password);
    setUser(result.user);
    return result;
  };

  // Fonction d'inscription
  const register = async (email, password) => {
    const result = await signup(email, password);
    setUser(result.user);
    return result;
  };

  // Fonction de déconnexion
  const logout = async () => {
    await signout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
```

### 3.4 Service API : api.js

**Responsabilités** :
- Client HTTP centralisé avec axios
- Fallback hors ligne avec localDB
- Gestion des tokens JWT
- Interception des réponses 401

**Architecture** :
```
api.js
├── Axios instance
│   ├── Intercepteur request (ajouter token)
│   └── Intercepteur response (gérer 401)
│
├── Fonctions d'authentification
│   ├── signup(email, password)
│   ├── signin(email, password)
│   ├── signout()
│   └── getCurrentUser()
│
├── Fonctions CRUD avec fallback
│   ├── getUsers() → [Try backend, Fallback localStorage]
│   ├── getUserById(id) → [Try backend, Fallback localStorage]
│   ├── createUser(data) → [Try backend, Fallback localStorage]
│   ├── updateUser(id, data) → [Try backend, Fallback localStorage]
│   └── deleteUser(id) → [Try backend, Fallback localStorage]
│
└── Fonctions utilitaires
    ├── isAuthenticated()
    ├── getToken()
    ├── getStoredUser()
    ├── isBackendOnline()
    └── resetBackendStatus()
```

**Code du fallback** :
```javascript
export const getUsers = async () => {
  try {
    // 1. Vérifier si backend disponible
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        // 2. Essayer API backend
        const response = await api.get('/users');
        return response.data;
      } catch (error) {
        // 3. Backend échoue, utiliser localStorage
        const users = localDB.getAllUsers();
        return { 
          message: 'Données locales (hors ligne)', 
          data: users,
          offline: true 
        };
      }
    } else {
      // 2. Backend non disponible, utiliser localStorage
      const users = localDB.getAllUsers();
      return { 
        message: 'Mode hors ligne', 
        data: users,
        offline: true 
      };
    }
  } catch (error) {
    // 3. Fallback ultime
    const users = localDB.getAllUsers();
    return { message: 'Mode hors ligne', data: users, offline: true };
  }
};
```

### 3.5 Base de données locale : localDB.js

**Classe LocalDB** - Service de stockage localStorage

**Méthodes** :

```javascript
new LocalDB()
  .initDB()                    // Initialiser avec données démo
  .getAllUsers()               // Array<User>
  .getUserById(id)             // User | undefined
  .createUser(userData)        // User
  .updateUser(id, userData)    // User
  .deleteUser(id)              // boolean
  .exportUsers()               // JSON string
  .importUsers(jsonData)       // boolean
  .reset()                     // void
```

**Clés localStorage utilisées** :
```javascript
// Clé 1 : Tableau des utilisateurs
localStorage.getItem('crud_app_users')
// [
//   { id: 1, age: 25, taille: 1.75, sexe: "M", poids: 70, ... },
//   ...
// ]

// Clé 2 : Compteur d'ID pour auto-incrémentation
localStorage.getItem('crud_app_user_id_counter')
// "4"

// Clés optionnelles (gérées par AuthContext)
localStorage.getItem('token')    // JWT token
localStorage.getItem('user')     // { id, email }
```

### 3.6 Pages

#### **Login.jsx - Page de connexion**

**Éléments** :
- Champ email (required)
- Champ mot de passe (required)
- Bouton de connexion
- Lien vers inscription
- Affichage des erreurs

**Flux** :
```
1. Utilisateur saisit email et mot de passe
2. Click bouton → handleSubmit()
3. Appel auth.login(email, password)
4. Si succès → Stocker token + utilisateur → Rediriger vers /dashboard
5. Si erreur → Afficher message d'erreur
```

#### **Register.jsx - Page d'inscription**

**Éléments** :
- Champ email (required, unique)
- Champ mot de passe (required, min 6 chars)
- Champ confirmation mot de passe (required, doit correspondre)
- Bouton d'inscription
- Lien vers connexion

**Validation** :
```javascript
// Validation côté frontend
email.includes('@') && email.length > 0  // Format email
password.length >= 6                     // Min 6 caractères
password === confirmPassword             // Correspondance
```

**Flux** :
```
1. Utilisateur saisit les champs
2. Validation locale
3. Click bouton → handleSubmit()
4. Appel auth.register(email, password)
5. Si succès → Message "Inscrit avec succès" → Redirection /login (2s)
6. Si erreur → Afficher message d'erreur
```

#### **Dashboard.jsx - Tableau de bord**

**Fonctionnalités** :
- Afficher tous les utilisateurs dans un tableau
- Ajouter un utilisateur (modal)
- Modifier un utilisateur (modal)
- Supprimer un utilisateur (confirmation)
- Afficher le nom de l'utilisateur connecté
- Bouton de déconnexion

**Structure de la table** :
```
┌────┬─────┬───────┬───────┬──────┬──────────┐
│ ID │ Âge │ Taille│ Poids │ Sexe │ Actions  │
├────┼─────┼───────┼───────┼──────┼──────────┤
│ 1  │ 25  │ 1.75  │ 70    │ M    │Mod│Supp │
│ 2  │ 20  │ 1.9   │ 90    │ M    │Mod│Supp │
│ 3  │ 19  │ 2.0   │ 100   │ F    │Mod│Supp │
└────┴─────┴───────┴───────┴──────┴──────────┘
```

**Modal d'édition** :
```
Champs :
- Âge (number, required)
- Taille en mètres (decimal, step 0.01)
- Poids en kg (decimal, step 0.1)
- Sexe (select M/F)

Boutons :
- Ajouter / Mettre à jour
- Annuler
```

**État** :
```javascript
{
  users: Array<User>,          // Tous les utilisateurs
  loading: boolean,             // Chargement des données
  error: string,                // Message d'erreur
  showModal: boolean,           // Modal visible ?
  editingUser: User | null,     // Utilisateur en édition
  formData: {                   // Données du formulaire
    age, taille, sexe, poids
  }
}
```

**Fonctions principales** :
```javascript
loadUsers()          // GET /users - charger les données
handleAdd()          // Ouvrir modal pour créer
handleEdit(user)     // Ouvrir modal pour éditer
handleSubmit(e)      // POST/PUT - sauvegarder
handleDelete(id)     // DELETE - supprimer avec confirmation
handleLogout()       // Déconnexion et redirection
```

### 3.7 Composant ProtectedRoute.jsx

**Responsabilité** : Protéger les routes qui nécessitent une authentification

**Logique** :
```javascript
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Afficher spinner pendant le chargement
  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  // L'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Utilisateur connecté, afficher le contenu
  return children;
};
```

**Flux** :
```
1. Vérifier si loading
   ├─ OUI → Afficher spinner
   └─ NON → Continuer
2. Vérifier si user existe
   ├─ NON → Rediriger vers /login
   └─ OUI → Afficher le contenu (children)
```

### 3.8 Styles : App.css

**Éléments stylisés** :
- Pages (login, register, dashboard)
- Formulaires (inputs, selects, buttons)
- Tables
- Modals
- Messages d'erreur/succès
- Responsive design (mobile-first)

**Exemples de classes** :
```css
.login-container          /* Container principal */
.form-group              /* Groupe de formulaire */
.btn-primary             /* Bouton principal */
.users-table             /* Tableau des utilisateurs */
.modal-overlay           /* Fond transparent du modal */
.error-message           /* Message d'erreur */
.loading                 /* Spinner de chargement */
```

---

## 4️⃣ FLUX D'AUTHENTIFICATION

### 4.1 Flux complet d'inscription

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUX D'INSCRIPTION                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend                          Backend                 │
│  ─────────────────────────────────────────────            │
│                                                             │
│  1. Utilisateur remplit                                    │
│     le formulaire (email, pwd)                             │
│     └─ Validation locale                                   │
│        (6 chars min, format email)                         │
│                                                             │
│  2. Click "S'inscrire"                                     │
│     └─ signup(email, password) ──────→ POST /auth/signup  │
│                                                             │
│                                        3. Vérifier email   │
│                                           unique           │
│                                           └─ OK            │
│                                                             │
│                                        4. Hash password    │
│                                           avec bcrypt      │
│                                           ($2b$10$...)     │
│                                                             │
│                                        5. Créer utilisateur│
│                                           en mémoire       │
│                                                             │
│                                        6. Générer JWT      │
│                                           jwt.sign({       │
│                                            email: ...      │
│                                           })               │
│                                                             │
│     ← Réponse avec token                                   │
│                                                             │
│  7. localStorage.setItem('token', token)                   │
│     localStorage.setItem('user', user)                     │
│                                                             │
│  8. Message "Succès"                                       │
│     └─ Redirection /login (2s)                             │
│                                                             │
│  9. Utilisateur peut se connecter                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Flux complet de connexion

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUX DE CONNEXION                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend                          Backend                 │
│  ─────────────────────────────────────────────            │
│                                                             │
│  1. Utilisateur remplit                                    │
│     le formulaire (email, pwd)                             │
│                                                             │
│  2. Click "Connexion"                                      │
│     └─ signin(email, password) ─────→ POST /auth/signin   │
│                                                             │
│                                        3. Chercher         │
│                                           utilisateur      │
│                                           par email        │
│                                           └─ Trouvé ?      │
│                                              OUI → Cont.   │
│                                              NON → 401 ×  │
│                                                             │
│                                        4. Comparer pwd     │
│                                           bcrypt.compare()│
│                                           └─ Correct ?     │
│                                              OUI → Cont.   │
│                                              NON → 401 ×  │
│                                                             │
│                                        5. Générer JWT      │
│                                           jwt.sign()       │
│                                                             │
│     ← Réponse avec token + user                            │
│                                                             │
│  6. localStorage.setItem('token', token)                   │
│     localStorage.setItem('user', user)                     │
│     AuthContext.setState({ user })                         │
│                                                             │
│  7. Redirection /dashboard                                 │
│                                                             │
│  8. ProtectedRoute vérifie user                            │
│     └─ Trouvé → Afficher Dashboard                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Flux d'accès à une route protégée

```
Utilisateur accède à /dashboard
    ↓
React Router → <ProtectedRoute>
    ↓
ProtectedRoute.jsx
    ├─ loading === true ?
    │  └─ OUI → Afficher spinner
    │  └─ NON → Continuer
    ├─ user !== null ?
    │  └─ OUI → Afficher Dashboard ✅
    │  └─ NON → Navigate /login ❌
    ↓
Dashboard.jsx charge les utilisateurs
    ├─ Appeler getUsers()
    ├─ API inclut le token (intercepteur)
    ├─ Backend vérifie le JWT (authMiddleware)
    ├─ Retourner les utilisateurs
    └─ Afficher la table
```

---

## 5️⃣ FLUX CRUD

### 5.1 Create - Créer un utilisateur

```
Frontend                          Backend
────────────────────────────────────────────

1. Modal ouvert
   └─ Champs vides

2. Utilisateur remplit
   ├─ age: 25
   ├─ taille: 1.75
   ├─ sexe: "M"
   └─ poids: 70

3. Click "Ajouter"
   └─ handleSubmit()
      └─ createUser(userData) ──→ POST /users
                                   ├─ Récupère le token du header
                                   ├─ Vérifie le JWT
                                   │  └─ authMiddleware
                                   ├─ Crée l'utilisateur
                                   │  ├─ id = max_id + 1
                                   │  ├─ created_at = now()
                                   │  └─ Ajoute à Map
                                   └─ Retourne le nouvel utilisateur

4. ← Réponse avec nouvel utilisateur

5. setState(users + nouvel utilisateur)
   └─ Fermer modal
   └─ Rafraîchir la table
   └─ Message "Créé avec succès"

6. Table mise à jour
   ├─ Nouvelle ligne visible
   └─ Peut être modifiée/supprimée
```

### 5.2 Read - Lire les utilisateurs

```
Frontend                          Backend
────────────────────────────────────────────

1. Dashboard s'ouvre
   └─ useEffect() → loadUsers()

2. getUsers() ────────────→ GET /users
                           ├─ Vérifie le JWT
                           ├─ Récupère tous les utilisateurs
                           │  (Array.from(Map.values()))
                           └─ Retourne JSON

3. ← Array d'utilisateurs

4. setState(users)
   └─ Afficher la table

5. Tableau affiche tous les utilisateurs
   avec leurs données complètes
```

### 5.3 Update - Mettre à jour

```
Frontend                          Backend
────────────────────────────────────────────

1. User clique "Modifier"
   └─ handleEdit(user)
      └─ Modal ouvert
      └─ Champs pré-remplis

2. Utilisateur change les valeurs
   ├─ age: 25 → 26
   └─ poids: 70 → 71

3. Click "Mettre à jour"
   └─ handleSubmit()
      └─ updateUser(id, userData) ──→ PUT /users/1
                                       ├─ Vérifie JWT
                                       ├─ Récupère l'utilisateur
                                       ├─ Fusionne les données
                                       │  {...oldUser, ...newData}
                                       ├─ Sauvegarde en Map
                                       └─ Retourne mis à jour

4. ← Utilisateur mis à jour

5. setState(users.map(...))
   └─ Remplacer ancien par nouveau
   └─ Fermer modal
   └─ Rafraîchir table

6. Table met à jour la ligne
   └─ Age: 26, Poids: 71
```

### 5.4 Delete - Supprimer

```
Frontend                          Backend
────────────────────────────────────────────

1. User clique "Supprimer"
   └─ handleDelete(id)
      └─ Confirmation dialog
         "Êtes-vous sûr ?"

2. Si OUI
   └─ deleteUser(id) ────────→ DELETE /users/1
                              ├─ Vérifie JWT
                              ├─ Cherche l'utilisateur
                              ├─ Supprime de la Map
                              └─ Retourne succès

3. ← Message de succès

4. setState(users.filter(id !== deletedId))
   └─ Supprimer de la liste
   └─ Rafraîchir table

5. Tableau sans la ligne supprimée
```

---

## 6️⃣ SÉCURITÉ

### 6.1 Authentification JWT

**JWT Token Structure** :
```
Header.Payload.Signature

Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "email": "user@email.com",
  "iat": 1234567890,  // Issued at
  "exp": 1234571490   // Expiration (optional)
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

**Processus de vérification** :
```javascript
// Backend
const decoded = jwt.verify(token, JWT_SECRET);
// Si le secret ou le payload est modifié, la vérification échoue
// Impossible de forger un token sans le secret
```

### 6.2 Hachage des mots de passe

**Avec bcrypt** :
```javascript
// Enregistrement
const plainPassword = 'Securite123';
const hashedPassword = await bcrypt.hash(plainPassword, 10);
// $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Ifq2a

// Connexion
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
// true ou false
```

**Avantages** :
✅ Non réversible (pas de "décryptage")  
✅ Salting automatique  
✅ Résistant aux attaques par force brute  
✅ Implémentation standard et sécurisée

### 6.3 Validation des entrées

**Frontend** :
```javascript
// Vérification basique
if (!email.includes('@')) { /* erreur */ }
if (password.length < 6) { /* erreur */ }
if (password !== confirmPassword) { /* erreur */ }
```

**Backend** :
```javascript
// Vérifications plus strictes
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) { /* 400 Bad Request */ }
if (password.length < 6) { /* 400 Bad Request */ }
```

### 6.4 Routes protégées

```javascript
// Sans protection (Erreur!)
app.get('/users', (req, res) => {
  res.json(getAllUsers());  // N'importe qui accède
});

// Avec protection (Correct!)
app.get('/users', authMiddleware, (req, res) => {
  // authMiddleware vérifie le JWT
  // Si invalide → 401 Unauthorized
  // Si valide → req.userId contient l'email
  res.json(getAllUsers());
});
```

### 6.5 Limitations et améliorations

**Limitations actuelles** ⚠️ :
- Secret JWT en clair dans le code
- Pas de HTTPS
- Pas de rate limiting
- localStorage effacé = données perdues
- Pas de CSRF protection

**Améliorations recommandées** 🔐 :
```javascript
// 1. Variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;

// 2. HTTPS en production
// Certificat SSL/TLS

// 3. Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requêtes max
});
app.use('/auth', limiter);

// 4. CSRF Token
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });

// 5. Session timeout
const JWT_EXPIRES_IN = '1h';

// 6. Refresh tokens
// Access token (court) + Refresh token (long)
```

---

## 7️⃣ MODE HORS LIGNE

### 7.1 Architecture offline-first

```
Application
    ↓
Tentative backend ?
    ├─ INTERNET → API backend ✅
    └─ OFFLINE → localStorage ✅
    ↓
Résultat identique pour l'utilisateur
```

### 7.2 Détection de disponibilité

```javascript
const checkBackendAvailability = async () => {
  try {
    // Ping le backend
    await api.get('/');  // Endpoint racine
    return true;  // Disponible
  } catch (error) {
    return false;  // Indisponible
  }
};
```

### 7.3 Fallback pour chaque opération

**Exemple : createUser()** :
```javascript
export const createUser = async (userData) => {
  try {
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        // Essayer l'API backend
        const response = await api.post('/users', userData);
        return response.data;
      } catch (error) {
        // Backend échoue → localStorage
        const user = localDB.createUser(userData);
        return { 
          message: 'Créé localement (mode hors ligne)', 
          data: user,
          offline: true 
        };
      }
    } else {
      // Pas de backend → localStorage
      const user = localDB.createUser(userData);
      return { 
        message: 'Mode hors ligne', 
        data: user,
        offline: true 
      };
    }
  } catch (error) {
    throw error;
  }
};
```

### 7.4 Synchronisation (futur)

Pour un vrai mode offline-first en production :
```javascript
// 1. Détecter les changements offline
// 2. Les stocker dans une queue
// 3. Quand online → synchroniser
// 4. Gérer les conflits (merge)

const offlineSyncQueue = [];

// Stocker les opérations
offlineSyncQueue.push({
  operation: 'CREATE',
  endpoint: '/users',
  data: userData,
  timestamp: Date.now()
});

// Synchroniser
const syncData = async () => {
  for (const operation of offlineSyncQueue) {
    try {
      await api[operation.operation.toLowerCase()](
        operation.endpoint,
        operation.data
      );
      offlineSyncQueue.remove(operation);
    } catch (error) {
      console.log('Sync échoué, réessai plus tard');
    }
  }
};
```

---

## 8️⃣ PERFORMANCE ET OPTIMISATIONS

### 8.1 Frontend optimisations

```javascript
// 1. Lazy loading des pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));

// 2. Memoization des composants
const ProtectedRoute = memo(({ children }) => {
  // ...
});

// 3. useCallback pour les fonctions
const handleDelete = useCallback((id) => {
  deleteUser(id).then(loadUsers);
}, []);

// 4. Vite minification en prod
// npm run build → frontend/dist/
```

### 8.2 Backend optimisations

```javascript
// 1. Caching
const cacheUsers = (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json(getAllUsers());
};

// 2. Compression
const compression = require('compression');
app.use(compression());

// 3. Pagination (futur)
app.get('/users', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  // return users.slice(offset, offset + limit);
});

// 4. Indexing en-mémoire
const usersIndex = new Map();  // email → user
```

### 8.3 localStorage optimisations

```javascript
// Limiter la taille
const MAX_USERS = 1000;
if (users.length > MAX_USERS) {
  // Archiver les anciennes entrées
  users = users.slice(-MAX_USERS);
}

// Compression de données (optionnel)
const compressed = LZ.compress(JSON.stringify(users));
localStorage.setItem('crud_app_users', compressed);

// Cleanup régulier
setInterval(() => {
  const users = getAllUsers();
  const recentUsers = users.filter(u => 
    Date.now() - new Date(u.created_at) < 90 * 24 * 60 * 60 * 1000
  );
  localStorage.setItem('crud_app_users', JSON.stringify(recentUsers));
}, 7 * 24 * 60 * 60 * 1000);  // Une fois par semaine
```

---

## 9️⃣ ERREURS ET GESTION

### 9.1 Types d'erreurs

| Erreur | Code | Cause | Solution |
|---|---|---|---|
| Email invalide | 400 | Format email incorrect | Vérifier le format |
| Email existe | 400 | Email déjà utilisé | Choisir autre email |
| Mot de passe court | 400 | Moins de 6 caractères | Min 6 caractères |
| Mot de passe incorrect | 401 | Mot de passe faux | Vérifier la saisie |
| Token invalide | 401 | JWT corrompu/expiré | Se reconnecter |
| Utilisateur non trouvé | 404 | ID inexistant | Vérifier l'ID |
| Serveur erreur | 500 | Bug côté backend | Vérifier les logs |

### 9.2 Gestion des erreurs

**Frontend** :
```javascript
try {
  const result = await login(email, password);
} catch (error) {
  // error peut être :
  // - error.response?.data?.error (API)
  // - error.message (réseau)
  // - error (autre)
  
  const message = error.response?.data?.error || error.message || 'Erreur inconnue';
  setError(message);
  
  // Afficher à l'utilisateur
  <div className="error-message">{error}</div>
}
```

**Backend** :
```javascript
app.use((error, req, res, next) => {
  console.error(error);
  
  const status = error.status || 500;
  const message = error.message || 'Erreur serveur';
  
  res.status(status).json({
    error: message,
    status: status
  });
});
```

---

## 🔟 CAS D'UTILISATION

### 10.1 Scénario 1: Inscription et connexion

```
1. Nouvel utilisateur
   → Page Register
   → Email: nouveau@email.com
   → Pwd: Securite123 (confirmé)
   → [S'inscrire]
   
2. Backend
   → Hash mot de passe
   → Générer JWT
   → Retourner token
   
3. Frontend
   → localStorage.setItem('token', ...)
   → Redirection /login (2s)
   
4. Utilisateur
   → Page Login
   → Email: nouveau@email.com
   → Pwd: Securite123
   → [Connexion]
   
5. Backend
   → Chercher utilisateur
   → Vérifier mot de passe
   → Générer JWT
   → Retourner token
   
6. Frontend
   → localStorage.setItem('token', ...)
   → AuthContext.setState({ user })
   → Redirection /dashboard
   
7. Dashboard
   → Afficher table vide
   → Bouton [+ Ajouter]
```

### 10.2 Scénario 2: Créer et gérer des utilisateurs

```
1. Dashboard chargé
   → Affiche 3 utilisateurs de démo

2. [+ Ajouter]
   → Modal ouvert
   
3. Remplir le formulaire
   → Âge: 25
   → Taille: 1.80
   → Poids: 75
   → Sexe: M
   
4. [Ajouter]
   → POST /users
   → Backend crée utilisateur
   → ID = 4
   
5. Dashboard
   → 4 utilisateurs affichés
   
6. Modifier utilisateur
   → [Modifier] sur l'ID 1
   → Modal pré-rempli
   → Changer Âge: 25 → 26
   → [Mettre à jour]
   
7. Supprimer utilisateur
   → [Supprimer] sur l'ID 2
   → Confirmation "Êtes-vous sûr ?"
   → DELETE /users/2
   
8. Dashboard final
   → 3 utilisateurs (1 modifié, 2 original, 4 nouveau)
```

### 10.3 Scénario 3: Mode hors ligne

```
1. Utilisateur en ligne
   → Créer utilisateur
   → Backend répond
   
2. Couper Internet
   → Backend non accessible
   
3. Créer nouvel utilisateur
   → API détecte backend indisponible
   → Fallback localStorage
   → Message: "Mode hors ligne - Créé localement"
   
4. Données stockées en localStorage
   → localStorage.crud_app_users
   
5. Restaurer Internet
   → Page rafraîche
   → Backend disponible
   → Les données locales restent
   
6. ⚠️ Limitation: Données créées hors ligne ne se synchronisent pas
   → Pour production: implémenter IndexedDB + Service Workers
```

---

## 🎯 RÉSUMÉ TECHNIQUE

### Points clés

✅ **Architecture** : MVC (Model-View-Controller)  
✅ **Authentification** : JWT + bcrypt  
✅ **Persistance** : localStorage (frontend) + Map (backend)  
✅ **Mode hors ligne** : Fallback automatique  
✅ **Sécurité** : Tokens signés, mots de passe hachés  
✅ **Responsive** : CSS adapté mobile/desktop  

### Améliorations futures

1. **Base de données persistante** (SQLite/PostgreSQL)
2. **Service Workers** (offline-first complet)
3. **Rate limiting** (protection authentification)
4. **HTTPS/TLS** (chiffrement réseau)
5. **Refresh tokens** (sécurité JWT)
6. **Testing** (Jest, RTL)
7. **Logging** (Winston, Morgan)
8. **Monitoring** (Sentry)

---

**Document généré** : Avril 2026  
**Version** : 1.0.0  
**Audience** : Développeurs, débutants à intermédiaires