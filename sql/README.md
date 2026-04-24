# Modèle de données - Table users

## Schéma de la table

| Colonne | Type | Contrainte | Description |
|---------|------|-------------|--------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique auto-incrémenté |
| age | INTEGER | NOT NULL | Âge de l'utilisateur |
| taille | DECIMAL(3,2) | NOT NULL | Taille en mètres (ex: 1.70) |
| sexe | VARCHAR(1) | NOT NULL, CHECK ('M' ou 'F') | Sexe de l'utilisateur |
| poids | INTEGER | NOT NULL | Poids en kg |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |

## Données initiales

| id | age | taille | sexe | poids | created_at |
|----|-----|--------|------|-------|------------|
| 1 | 25 | 1.70 | F | 80 | auto |
| 2 | 20 | 1.90 | M | 90 | auto |
| 3 | 19 | 2.00 | F | 100 | auto |

## Requêtes SQL

### Créer la table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  age INTEGER NOT NULL,
  taille DECIMAL(3,2) NOT NULL,
  sexe VARCHAR(1) NOT NULL CHECK (sexe IN ('M', 'F')),
  poids INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Insérer des données
```sql
INSERT INTO users (age, taille, sexe, poids) VALUES
(25, 1.70, 'F', 80),
(20, 1.90, 'M', 90),
(19, 2.00, 'F', 100);
```

### Sélectionner tous les utilisateurs
```sql
SELECT * FROM users;
```

### Filtrer par âge
```sql
SELECT * FROM users WHERE age IN (20, 25);
```

### Mettre à jour un utilisateur
```sql
UPDATE users SET age = 26 WHERE id = 1;
```

### Supprimer un utilisateur
```sql
DELETE FROM users WHERE id = 1;
```