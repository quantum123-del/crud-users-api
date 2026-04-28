// filepath: frontend/src/services/localDB.js
/**
 * Service de base de données locale
 * Utilise localStorage pour une persistance simple
 * Fonctionne entièrement hors ligne sans connexion réseau
 */

class LocalDB {
  constructor() {
    this.usersKey = 'crud_app_users';
    this.userIdCounterKey = 'crud_app_user_id_counter';
    this.initDB();
  }

  initDB() {
    // Initialiser le compteur d'ID s'il n'existe pas
    if (!localStorage.getItem(this.userIdCounterKey)) {
      localStorage.setItem(this.userIdCounterKey, '4'); // Commencer à 5 (après les 4 utilisateurs de demo)
    }

    // Charger les données de démo si vide
    if (!localStorage.getItem(this.usersKey)) {
      const demoUsers = [
        { id: 1, age: 25, taille: 1.7, sexe: 'F', poids: 80, created_at: '2026-04-24T07:38:56.522925' },
        { id: 2, age: 20, taille: 1.9, sexe: 'M', poids: 90, created_at: '2026-04-24T07:38:56.522925' },
        { id: 3, age: 19, taille: 2, sexe: 'F', poids: 100, created_at: '2026-04-24T07:38:56.522925' }
      ];
      localStorage.setItem(this.usersKey, JSON.stringify(demoUsers));
    }
  }

  // Obtenir tous les utilisateurs
  getAllUsers() {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la lecture des utilisateurs:', error);
      return [];
    }
  }

  // Obtenir un utilisateur par ID
  getUserById(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === parseInt(id));
  }

  // Créer un nouvel utilisateur
  createUser(userData) {
    try {
      const users = this.getAllUsers();
      const id = parseInt(localStorage.getItem(this.userIdCounterKey)) + 1;
      
      const newUser = {
        id,
        age: userData.age,
        taille: userData.taille,
        sexe: userData.sexe,
        poids: userData.poids,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      localStorage.setItem(this.userIdCounterKey, String(id));
      
      return newUser;
    } catch (error) {
      console.error('Erreur lors de la création d\'un utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  updateUser(id, userData) {
    try {
      const users = this.getAllUsers();
      const index = users.findIndex(u => u.id === parseInt(id));
      
      if (index === -1) {
        throw new Error('Utilisateur non trouvé');
      }

      users[index] = {
        ...users[index],
        ...userData,
        id: parseInt(id)
      };

      localStorage.setItem(this.usersKey, JSON.stringify(users));
      return users[index];
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  }

  // Supprimer un utilisateur
  deleteUser(id) {
    try {
      const users = this.getAllUsers();
      const filteredUsers = users.filter(u => u.id !== parseInt(id));

      if (filteredUsers.length === users.length) {
        throw new Error('Utilisateur non trouvé');
      }

      localStorage.setItem(this.usersKey, JSON.stringify(filteredUsers));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  // Exporter tous les utilisateurs (pour sauvegarde)
  exportUsers() {
    return JSON.stringify(this.getAllUsers(), null, 2);
  }

  // Importer des utilisateurs
  importUsers(jsonData) {
    try {
      const users = JSON.parse(jsonData);
      if (!Array.isArray(users)) {
        throw new Error('Les données doivent être un tableau');
      }
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw error;
    }
  }

  // Réinitialiser la base de données
  reset() {
    localStorage.removeItem(this.usersKey);
    localStorage.removeItem(this.userIdCounterKey);
    this.initDB();
  }
}

// Créer une instance unique
const localDB = new LocalDB();

export default localDB;