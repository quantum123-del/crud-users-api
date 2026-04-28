const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

// Clé secrète pour JWT (en production, utiliser une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-key-super-securise-2024';

// Fichier de stockage local
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Charger les utilisateurs depuis le fichier
const loadUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return new Map(JSON.parse(data));
    }
  } catch (err) {
    console.error('Erreur chargement users:', err);
  }
  return new Map();
};

// Sauvegarder les utilisateurs dans le fichier
const saveUsers = (users) => {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify([...users], null, 2));
  } catch (err) {
    console.error('Erreur sauvegarde users:', err);
  }
};

// Stockage local des utilisateurs (persistent)
let localUsers = loadUsers();

// POST /auth/signup - Créer un nouvel utilisateur avec email et mot de passe
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    
    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }
    
    // Validation du mot de passe (minimum 6 caractères)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    
    // Vérifier si l'utilisateur existe déjà en local
    if (localUsers.has(email.toLowerCase())) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Essayer avec Supabase Auth
    let supabaseUser = null;
    let supabaseError = null;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        supabaseError = error;
      } else {
        supabaseUser = data.user;
      }
    } catch (e) {
      supabaseError = e;
    }
    
    // Si Supabase Auth échoue, utiliser l'authentification locale
    if (supabaseError || !supabaseUser) {
      console.log('Utilisation de l\'authentification locale');
      
      // Créer l'utilisateur en local
      const userId = 'local_' + Date.now();
      const user = {
        id: userId,
        email: email.toLowerCase(),
        created_at: new Date().toISOString()
      };
      
      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      localUsers.set(email.toLowerCase(), {
        user,
        password: hashedPassword
      });
      
      // Sauvegarder les utilisateurs
      saveUsers(localUsers);
      
      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.status(201).json({
        message: 'Utilisateur créé avec succès (mode local)',
        user,
        token
      });
    }
    
    // Si Supabase Auth a fonctionné
    const token = jwt.sign(
      { userId: supabaseUser.id, email: supabaseUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: supabaseUser,
      token
    });
    
  } catch (err) {
    console.error('Erreur signup:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /auth/signin - Connexion d'un utilisateur
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    
    // Essayer avec Supabase Auth
    let supabaseData = null;
    let supabaseError = null;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        supabaseError = error;
      } else {
        supabaseData = data;
      }
    } catch (e) {
      supabaseError = e;
    }
    
    // Si Supabase Auth a fonctionné
    if (supabaseData && supabaseData.user) {
      const token = jwt.sign(
        { userId: supabaseData.user.id, email: supabaseData.user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.json({
        message: 'Connexion réussie',
        user: supabaseData.user,
        token
      });
    }
    
    // Sinon, essayer l'authentification locale
    const localUser = localUsers.get(email.toLowerCase());
    
    if (localUser) {
      const validPassword = await bcrypt.compare(password, localUser.password);
      
      if (validPassword) {
        const token = jwt.sign(
          { userId: localUser.user.id, email: localUser.user.email },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return res.json({
          message: 'Connexion réussie (mode local)',
          user: localUser.user,
          token
        });
      }
    }
    
    // Si ni Supabase ni local ne fonctionne
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    
  } catch (err) {
    console.error('Erreur signin:', err);
    res.status(401).json({ message: 'Email ou mot de passe incorrect', error: err.message });
  }
});

// POST /auth/signout - Déconnexion d'un utilisateur
router.post('/signout', async (req, res) => {
  try {
    // Tenter de signer out de Supabase
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignorer les erreurs Supabase
    }
    
    res.json({ message: 'Déconnexion réussie' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /auth/me - Obtenir l'utilisateur actuel
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Non autorisé' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
    
    // Chercher l'utilisateur en local ou via Supabase
    let user = null;
    
    // Chercher dans les utilisateurs locaux
    for (const [email, data] of localUsers.entries()) {
      if (data.user.id === decoded.userId) {
        user = data.user;
        break;
      }
    }
    
    // Si pas trouvé en local, essayer Supabase
    if (!user) {
      try {
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
        if (!error && supabaseUser) {
          user = supabaseUser;
        }
      } catch (e) {
        // Ignorer les erreurs Supabase
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Non autorisé', error: err.message });
  }
});

module.exports = router;