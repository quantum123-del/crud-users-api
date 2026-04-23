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
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  res.json(user);
};

// POST /users - Créer un nouvel utilisateur
exports.createUser = (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
};

// DELETE /users/:id - Supprimer un utilisateur par ID
exports.deleteUser = (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  users.splice(userIndex, 1);
  res.status(204).send();
};

// PUT /users/:id - Modifier un utilisateur par ID
exports.updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  users[userIndex] = { ...users[userIndex], ...req.body };
  res.json(users[userIndex]);
};
