const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Base de données interne : tableau d'utilisateurs
const users = [
  { id: 1, age: 25, taille: 1.70, sexe: 'F', poids: 80 },
  { id: 2, age: 20, taille: 1.90, sexe: 'M', poids: 90 },
  { id: 3, age: 19, taille: 2, sexe: 'F', poids: 100 }
];

app.get('/', (req, res) => {
  res.json({
    status: "ok",
    message: "Le serveur est en cours d'exécution avec succès"
  });
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});