const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

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
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: data.user,
      session: data.session
    });
  } catch (err) {
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
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    res.json({
      message: 'Connexion réussie',
      user: data.user,
      session: data.session
    });
  } catch (err) {
    res.status(401).json({ message: 'Email ou mot de passe incorrect', error: err.message });
  }
});

// POST /auth/signout - Déconnexion d'un utilisateur
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
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
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Token invalide', error: err.message });
  }
});

module.exports = router;