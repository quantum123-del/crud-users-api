const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Clé secrète pour JWT (doit correspondre à celle du authRouter)
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-key-super-securise-2024';

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
    
    // Essayer d'abord de vérifier avec notre JWT local
    let user = null;
    let isLocalToken = false;
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      user = {
        id: decoded.userId,
        email: decoded.email
      };
      isLocalToken = true;
    } catch (e) {
      // Token JWT local invalide, essayer avec Supabase
    }
    
    // Si ce n'est pas un token local, essayer avec Supabase
    if (!user) {
      try {
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
        
        if (error) throw error;
        if (!supabaseUser) {
          return res.status(401).json({ message: 'Token invalide ou expiré' });
        }
        
        user = supabaseUser;
      } catch (e) {
        return res.status(401).json({ message: 'Token invalide ou expiré' });
      }
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.isLocalToken = isLocalToken;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Non autorisé', error: err.message });
  }
};