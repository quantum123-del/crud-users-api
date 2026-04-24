const supabase = require('../config/supabase');

// GET /users - Récupérer tous les utilisateurs avec filtrage par âge
exports.getAllUsers = async (req, res) => {
  try {
    let query = supabase.from('users').select('*');
    
    if (req.query.age) {
      const ages = Array.isArray(req.query.age) ? req.query.age.map(Number) : [Number(req.query.age)];
      query = query.in('age', ages);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json({
      message: 'Liste des utilisateurs récupérée avec succès',
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /users/:id - Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID invalide' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({
      message: 'Utilisateur récupéré avec succès',
      data: data
    });
  } catch (err) {
    if (err.message.includes('no rows')) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// POST /users - Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const { age, taille, sexe, poids } = req.body;
    
    // Validation des champs requis
    if (age === undefined || taille === undefined || sexe === undefined || poids === undefined) {
      return res.status(400).json({ message: 'Tous les champs sont requis (age, taille, sexe, poids)' });
    }
    
    // Validation des types
    if (typeof age !== 'number' || typeof taille !== 'number' || typeof poids !== 'number') {
      return res.status(400).json({ message: 'age, taille et poids doivent être des nombres' });
    }
    
    if (typeof sexe !== 'string' || !['M', 'F'].includes(sexe.toUpperCase())) {
      return res.status(400).json({ message: 'sexe doit être "M" ou "F"' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ age, taille, sexe: sexe.toUpperCase(), poids }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// DELETE /users/:id - Supprimer un utilisateur par ID
exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID invalide' });
    }
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// PUT /users/:id - Modifier un utilisateur par ID
exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID invalide' });
    }
    
    const { age, taille, sexe, poids } = req.body;
    
    // Validation des types si les champs sont présents
    if (age !== undefined && typeof age !== 'number') {
      return res.status(400).json({ message: 'age doit être un nombre' });
    }
    if (taille !== undefined && typeof taille !== 'number') {
      return res.status(400).json({ message: 'taille doit être un nombre' });
    }
    if (poids !== undefined && typeof poids !== 'number') {
      return res.status(400).json({ message: 'poids doit être un nombre' });
    }
    if (sexe !== undefined && !['M', 'F'].includes(sexe.toUpperCase())) {
      return res.status(400).json({ message: 'sexe doit être "M" ou "F"' });
    }
    
    const updateData = { ...req.body };
    if (sexe) updateData.sexe = sexe.toUpperCase();
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({
      message: 'Utilisateur mis à jour avec succès',
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
