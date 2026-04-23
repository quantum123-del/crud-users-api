const express = require('express');
const router = express.Router();
const users = require('../data/usersData');

// GET /users - Récupérer tous les utilisateurs avec filtrage par âge
router.get('/', (req, res) => {
  let filteredUsers = users;
  if (req.query.age) {
    const ages = Array.isArray(req.query.age) ? req.query.age.map(Number) : [Number(req.query.age)];
    filteredUsers = users.filter(u => ages.includes(u.age));
  }
  res.json(filteredUsers);
});

// GET /users/:id - Récupérer un utilisateur par ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  res.json(user);
});

// POST /users - Créer un nouvel utilisateur
router.post('/', (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

module.exports = router;