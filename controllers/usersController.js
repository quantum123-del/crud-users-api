const users = require('../data/usersData');

// GET /users - Récupérer tous les utilisateurs avec filtrage par âge
exports.getAllUsers = (req, res) => {
  let filteredUsers = users;
  if (req.query.age) {
    const ages = Array.isArray(req.query.age) ? req.query.age.map(Number) : [Number(req.query.age)];
    filteredUsers = users.filter(u => ages.includes(u.age));
  }
  res.json(filteredUsers);
};

// GET /users/:id - Récupérer un utilisateur par ID
exports.getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  res.json(user);
};

// POST /users - Créer un nouvel utilisateur
exports.createUser = (req, res) => {
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
  
  // Générer un nouvel ID unique
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, age, taille, sexe: sexe.toUpperCase(), poids };
  users.push(newUser);
  res.status(201).json(newUser);
};

// DELETE /users/:id - Supprimer un utilisateur par ID
exports.deleteUser = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  users.splice(userIndex, 1);
  res.status(204).send();
};

// PUT /users/:id - Modifier un utilisateur par ID
exports.updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
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
  
  users[userIndex] = { ...users[userIndex], ...req.body, sexe: sexe ? sexe.toUpperCase() : users[userIndex].sexe };
  res.json(users[userIndex]);
};
