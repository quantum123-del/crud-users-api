const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});