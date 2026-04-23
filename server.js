const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Base de données interne : tableau d'utilisateurs
const users = [
  {
    id: 1,
    age: 25,
    taille: 1.70,
    sexe: 'F',
    poids: 80
  },
  { 
    id: 2,
    age: 20,
    taille: 1.90,
    sexe: 'M',
    poids: 90
  },
  { 
    id: 3,
    age: 19,
    taille: 2,
    sexe: 'F',
    poids: 100
  }
];

app.get('/', (req, res) => {
  res.json({
    status: "ok",
    message: "Le serveur est en cours d'exécution avec succès"
  });
});

app.get('/users', (req, res) => {
  let filteredUsers = users;
  if (req.query.age) {
    const ages = Array.isArray(req.query.age) ? req.query.age.map(Number) : [Number(req.query.age)];
    filteredUsers = users.filter(u => ages.includes(u.age));
  }
  res.json(filteredUsers);
});

app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  res.json(user);
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});