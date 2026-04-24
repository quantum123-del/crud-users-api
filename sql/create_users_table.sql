-- Script de création de la table users dans Supabase
-- Exécuter ce script dans le SQL Editor de Supabase

-- Supprimer la table si elle existe (pour recréer proprement)
DROP TABLE IF EXISTS users;

-- Créer la table users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  age INTEGER NOT NULL,
  taille DECIMAL(3,2) NOT NULL,
  sexe VARCHAR(1) NOT NULL CHECK (sexe IN ('M', 'F')),
  poids INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les données initiales
INSERT INTO users (age, taille, sexe, poids) VALUES
(25, 1.70, 'F', 80),
(20, 1.90, 'M', 90),
(19, 2.00, 'F', 100);

-- Activer Row Level Security (RLS) - optionnel avec service_role
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Créer une politique d'accès public pour le service_role
-- DROP POLICY IF EXISTS "Allow all" ON users;
-- CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);