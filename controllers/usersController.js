const supabase = require('../config/supabase');

// GET /users - Récupérer les données de l'utilisateur connecté uniquement
exports.getAllUsers = async (req, res) => {
  try {
    // Récupérer l'email depuis le token JWT
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Non autorisé' });
    }
    
    // Récupérer uniquement les données de cet utilisateur
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({
      message: 'Données récupérées avec succès',
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /users/:id - Récupérer une donnée par ID
exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Non autorisé' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('user_email', userEmail)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Donnée non trouvée' });
    }
    res.json({
      message: 'Donnée récupérée avec succès',
      data: data
    });
  } catch (err) {
    if (err.message.includes('no rows')) {
      return res.status(404).json({ message: 'Donnée non trouvée' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// POST /users - Créer une nouvelle donnée
exports.createUser = async (req, res) => {
  try {
    // Récupérer l'email depuis le token JWT
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Non autorisé' });
    }
    
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
        user_email: userEmail,
        age: userAge, 
        taille: userTaille, 
        sexe: userSexe.toUpperCase(), 
        poids: userPoids
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json({
      message: 'Données enregistrées avec succès! Un administrateur consultera vos informations.',
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// DELETE /users/:id - Supprimer une donnée par ID
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Non autorisé' });
    }
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('user_email', userEmail);
    
    if (error) throw error;
    res.status(200).json({ message: 'Donnée supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// PUT /users/:id - Modifier une donnée par ID
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Non autorisé' });
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
    const updateData = { updated_at: new Date().toISOString() };
    if (userAge !== undefined) updateData.age = userAge;
    if (userTaille !== undefined) updateData.taille = userTaille;
    if (userSexe !== undefined) updateData.sexe = userSexe.toUpperCase();
    if (userPoids !== undefined) updateData.poids = userPoids;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .eq('user_email', userEmail)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Donnée non trouvée' });
    }
    res.json({
      message: 'Donnée mise à jour avec succès',
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
