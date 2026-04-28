-- Table pour stocker les données collectées
CREATE TABLE IF NOT EXISTS collected_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  age INTEGER,
  taille DECIMAL(5,2),
  poids DECIMAL(5,2),
  sexe TEXT CHECK (sexe IN ('M', 'F')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer Row Level Security (RLS)
ALTER TABLE collected_data ENABLE ROW LEVEL SECURITY;

-- Politique: seul le propriétaire peut voir ses données
CREATE POLICY "Users can only see their own data" ON collected_data
  FOR ALL USING (auth.uid() = user_email);

-- Politique pour l'admin (toi)
CREATE POLICY "Admin can see all data" ON collected_data
  FOR SELECT USING (auth.email() = 'ton-email@exemple.com');

-- Table pour les utilisateurs de l'app (collecte de données)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);