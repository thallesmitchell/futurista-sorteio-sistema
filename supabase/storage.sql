
-- Criar bucket para logos se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  -- Criar o bucket se ele não existir
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE name = 'logos'
  ) THEN
    INSERT INTO storage.buckets (id, name)
    VALUES ('logos', 'logos');
  END IF;

  -- Permitir acesso público para visualização de logos
  INSERT INTO storage.policies (name, definition, bucket_id)
  VALUES 
    ('Logos are publicly accessible', 
    '(bucket_id = ''logos''::text)', 
    'logos')
  ON CONFLICT DO NOTHING;

  -- RLS para permitir que usuários autenticados enviem logos
  INSERT INTO storage.policies (name, definition, bucket_id)
  VALUES 
    ('Authenticated users can upload logos', 
    '(bucket_id = ''logos''::text AND auth.role() = ''authenticated''::text)', 
    'logos')
  ON CONFLICT DO NOTHING;
  
  -- RLS para permitir que usuários autenticados atualizem seus próprios logos
  INSERT INTO storage.policies (name, definition, bucket_id)
  VALUES 
    ('Users can update own logos', 
    '(bucket_id = ''logos''::text AND auth.role() = ''authenticated''::text AND (storage.foldername(name))[1] = auth.uid()::text)', 
    'logos')
  ON CONFLICT DO NOTHING;
  
  -- Aplicar as políticas
  UPDATE storage.buckets
  SET public = true
  WHERE name = 'logos';
END $$;
