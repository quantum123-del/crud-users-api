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
    // Accepter les deux formats: {age, taille, sexe, poids} ou {name, age, height, gender, weight}
    const { age, taille, sexe, poids, name, height, gender, weight } = req.body;
    
    // Normaliser les champs
    const userAge = age !== undefined ? age : (req.body.age ? parseInt(req.body.age) : undefined);
    const userTaille = taille !== undefined ? taille : (height ? parseFloat(height) : undefined);
    const userSexe = sexe !== undefined ? sexe : (gender ? (gender.toLowerCase() === 'homme' ? 'M' : gender.toLowerCase() === 'femme' ? 'F' : gender) : undefined);
    const userPoids = poids !== undefined ? poids : (weight ? parseFloat(weight) : undefined);
    
    // Validation des champs requis
    if (userAge === undefined || userTaille === undefined || userSexe === undefined || userPoids === undefined) {
      return res.status(400).json({ message: 'Tous les champs sont requis (age, taille, sexe, poids)' });
    }
    
    // Validation des types
    if (typeof userAge !== 'number' || typeof userTaille !== 'number' || typeof userPoids !== 'number') {
      return res.status(400).json({ message: 'age, taille et poids doivent être des nombres' });
    }
    
    if (typeof userSexe !== 'string' || !['M', 'F'].includes(userSexe.toUpperCase())) {
      return res.status(400).json({ message: 'sexe doit être "M" ou "F"' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        age: userAge, 
        taille: userTaille, 
        sexe: userSexe.toUpperCase(), 
        poids: userPoids
      }])
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
    
    // Accepter les deux formats
    const { age, taille, sexe, poids, height, gender, weight } = req.body;
    
    // Normaliser les champs
    const userAge = age !== undefined ? age : (req.body.age ? parseInt(req.body.age) : undefined);
    const userTaille = taille !== undefined ? taille : (height ? parseFloat(height) : undefined);
    const userSexe = sexe !== undefined ? sexe : (gender ? (gender.toLowerCase() === 'homme' ? 'M' : gender.toLowerCase() === 'femme' ? 'F' : gender) : undefined);
    const userPoids = poids !== undefined ? poids : (weight ? parseFloat(weight) : undefined);
    
    // Validation des types si les champs sont présents
    if (userAge !== undefined && typeof userAge !== 'number') {
      return res.status(400).json({ message: 'age doit être un nombre' });
    }
    if (userTaille !== undefined && typeof userTaille !== 'number') {
      return res.status(400).json({ message: 'taille doit être un nombre' });
    }
    if (userPoids !== undefined && typeof userPoids !== 'number') {
      return res.status(400).json({ message: 'poids doit être un nombre' });
    }
    if (userSexe !== undefined && !['M', 'F'].includes(userSexe.toUpperCase())) {
      return res.status(400).json({ message: 'sexe doit être "M" ou "F"' });
    }
    
    // Construire l'objet de mise à jour
    const updateData = {};
    if (userAge !== undefined) updateData.age = userAge;
    if (userTaille !== undefined) updateData.taille = userTaille;
    if (userSexe !== undefined) updateData.sexe = userSexe.toUpperCase();
    if (userPoids !== undefined) updateData.poids = userPoids;
    
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
