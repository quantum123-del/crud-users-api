# API REST de Collecte de Données Utilisateurs

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-5.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-orange)
![Status](https://img.shields.io/badge/Status-Actif-success)

## 📋 Description du Projet

Cette API REST a été développée pour collecter et gérer des données d'utilisateurs (âge, taille, sexe, poids). Elle implémente un système complet de CRUD (Create, Read, Update, Delete) avec authentification sécurisée.

## 🏗️ Architecture du Projet

```
crud-users-api/
├── config/
│   └── supabase.js          # Configuration Supabase
├── controllers/
│   └── usersController.js   # Logique métier utilisateurs
├── data/
│   └── usersData.js         # Données initiales (backup local)
├── middlewares/
│   └── authMiddleware.js    # Middleware d'authentification
├── routers/
│   ├── authRouter.js       # Routes d'authentification
│   └── usersRouter.js      # Routes utilisateurs
├── sql/
│   ├── create_users_table.sql  # Script création table
│   └── README.md               # Documentation modèle données
├── server.js               # Point d'entrée principal
└── package.json            # Dépendances du projet
```

## 🚀 Fonctionnalités

### Routes Publiques
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Vérification du serveur |
| POST | `/auth/signup` | Inscription utilisateur |
| POST | `/auth/signin` | Connexion utilisateur |
| POST | `/auth/signout` | Déconnexion |
| GET | `/auth/me` | Informations utilisateur actuel |

### Routes Protégées (Authentification Requise)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/users` | Liste tous les utilisateurs (avec filtrage par âge) |
| GET | `/users/:id` | Récupère un utilisateur par ID |
| POST | `/users` | Crée un nouvel utilisateur |
| PUT | `/users/:id` | Met à jour un utilisateur |
| DELETE | `/users/:id` | Supprime un utilisateur |

### Filtrage
- `GET /users?age=20&age=25` - Filtrer par un ou plusieurs âges

## 🔐 Authentification

Le système utilise **Supabase Auth** pour gérer l'authentification :
- Inscription avec email et mot de passe
- Connexion sécurisée avec JWT
- Middleware de protection des routes

### Format du Token
```
Authorization: Bearer <votre_token_jwt>
```

## 🛠️ Installation

```bash
# Cloner le projet
git clone <url_du_repo>
cd crud-users-api

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# (voir section Configuration)

# Lancer le serveur
npm run dev
```

## ⚙️ Configuration

### Prérequis
- Node.js 18.x ou supérieur
- Un compte Supabase

### Variables d'Environnement
Créer un fichier `.env` à la racine du projet :
```env
PORT=3000
SUPABASE_URL=votre_url_supabase
SUPABASE_KEY=votre_service_role_key
```

## 📖 Utilisation de l'API

### 1. Inscription
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"utilisateur@exemple.com","password":"motdepasse123"}'
```

### 2. Connexion
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"utilisateur@exemple.com","password":"motdepasse123"}'
```

### 3. Créer un utilisateur (protégé)
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"age":25,"taille":1.70,"sexe":"F","poids":80}'
```

### 4. Lister les utilisateurs (protégé)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <token>"
```

### 5. Filtrer par âge (protégé)
```bash
curl -X GET "http://localhost:3000/users?age=20&age=25" \
  -H "Authorization: Bearer <token>"
```

## 🗄️ Modèle de Données

### Table Users (Supabase)

| Colonne | Type | Contrainte | Description |
|---------|------|-------------|--------------|
| id | SERIAL | PRIMARY KEY | ID unique auto-incrémenté |
| age | INTEGER | NOT NULL | Âge de l'utilisateur |
| taille | DECIMAL(3,2) | NOT NULL | Taille en mètres |
| sexe | VARCHAR(1) | NOT NULL, CHECK ('M' ou 'F') | Sexe |
| poids | INTEGER | NOT NULL | Poids en kg |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |

### Script SQL
Voir le fichier `sql/create_users_table.sql` pour créer la table dans Supabase.

## 📝 Messages de Réponse

Chaque requête réussie retourne un message descriptif :
- `"Liste des utilisateurs récupérée avec succès"`
- `"Utilisateur récupéré avec succès"`
- `"Utilisateur créé avec succès"`
- `"Utilisateur mis à jour avec succès"`
- `"Utilisateur supprimé avec succès"`

## 🔧 Gestion des Erreurs

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Requête invalide |
| 401 | Non autorisé |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

## 📦 Dépendances

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "express": "^5.x"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

## 🔄 Routes Git

```bash
# Historique des commits
git log --oneline

# Branche principale
git branch -M main
```

## 👨‍💻 Auteur

- Développeur Full Stack

## 📄 Licence

ISC

## 🔗 Liens Utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Express](https://expressjs.com/fr/)
- [Node.js](https://nodejs.org/)

---

**Note** : Ce projet utilise une base de données Supabase externe. Assurez-vous d'avoir créé la table `users` dans votre projet Supabase avant d'utiliser l'API.