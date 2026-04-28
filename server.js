const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Permet l'accès depuis tous les appareils
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Route principale
app.get('/', (req, res) => {
  res.json({
    status: "ok",
    message: "Le serveur est en cours d'exécution avec succès"
  });
});

// Routes utilisateurs
app.use('/users', require('./routers/usersRouter'));

// Routes authentification
app.use('/auth', require('./routers/authRouter'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur lancé sur http://0.0.0.0:${PORT}`);
  console.log(`Accessible sur http://localhost:${PORT}`);
});