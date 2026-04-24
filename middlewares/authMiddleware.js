const supabase = require('../config/supabase');

// Middleware pour vérifier l'authentification
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token d\'authentification requis' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token d\'authentification requis' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    
    if (!user) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Non autorisé', error: err.message });
  }
};