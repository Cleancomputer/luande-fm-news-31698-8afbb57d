-- Criar storage bucket para mídias
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true);

-- Políticas para o bucket de mídias
CREATE POLICY "Admins podem fazer upload de mídias"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem atualizar mídias"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem deletar mídias"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Mídias são publicamente acessíveis"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Atualizar tabela articles com novos campos
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS subtitle text,
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS article_type text DEFAULT 'article',
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_position text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS media_gallery jsonb DEFAULT '[]'::jsonb;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled ON articles(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);

-- Tabela de histórico de versões
CREATE TABLE IF NOT EXISTS article_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  version integer NOT NULL,
  title text NOT NULL,
  subtitle text,
  content text NOT NULL,
  image_url text,
  category text NOT NULL,
  tags text[],
  media_gallery jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver histórico"
ON article_versions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem criar versões"
ON article_versions FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Tabela de mídias
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  mime_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar biblioteca de mídias"
ON media_library FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Todos podem ver mídias"
ON media_library FOR SELECT
USING (true);

-- Função para criar slug automático
CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug text;
  counter integer := 0;
  base_slug text;
BEGIN
  -- Converter para minúsculas e remover acentos
  base_slug := lower(unaccent(title));
  -- Substituir espaços e caracteres especiais por hífens
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  -- Remover hífens duplos
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  -- Remover hífens no início e fim
  base_slug := trim(both '-' from base_slug);
  
  slug := base_slug;
  
  -- Garantir unicidade
  WHILE EXISTS (SELECT 1 FROM articles WHERE articles.slug = slug) LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN slug;
END;
$$;

-- Trigger para gerar slug automaticamente
CREATE OR REPLACE FUNCTION set_article_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER article_slug_trigger
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION set_article_slug();