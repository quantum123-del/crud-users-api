const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// GET /users - Récupérer tous les utilisateurs avec filtrage par âge
router.get('/', usersController.getAllUsers);

// GET /users/:id - Récupérer un utilisateur par ID
router.get('/:id', usersController.getUserById);

// POST /users - Créer un nouvel utilisateur
router.post('/', usersController.createUser);

// DELETE /users/:id - Supprimer un utilisateur par ID
router.delete('/:id', usersController.deleteUser);

// PUT /users/:id - Modifier un utilisateur par ID
router.put('/:id', usersController.updateUser);

module.exports = router;