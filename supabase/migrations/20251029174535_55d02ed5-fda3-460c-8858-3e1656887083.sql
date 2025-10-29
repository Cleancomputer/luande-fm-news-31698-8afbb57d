-- Remover triggers e funções existentes
DROP TRIGGER IF EXISTS set_article_slug_trigger ON articles;
DROP TRIGGER IF EXISTS article_slug_trigger ON articles;
DROP FUNCTION IF EXISTS public.set_article_slug() CASCADE;
DROP FUNCTION IF EXISTS public.generate_slug(text) CASCADE;

-- Recriar função generate_slug com lógica correta
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Gerar slug base a partir do título
  base_slug := lower(unaccent(title));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Começar com o slug base
  final_slug := base_slug;
  
  -- Verificar se já existe e adicionar número se necessário
  WHILE EXISTS (SELECT 1 FROM articles WHERE articles.slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- Recriar função set_article_slug com referências qualificadas
CREATE OR REPLACE FUNCTION public.set_article_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Se o slug não foi fornecido ou está vazio, gerar automaticamente
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  ELSE
    -- Se um slug foi fornecido, verificar se já existe
    -- Apenas verificar se não é uma atualização do mesmo registro
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.slug != NEW.slug) THEN
      -- Se o slug fornecido já existe em outro registro, gerar um novo
      IF EXISTS (
        SELECT 1 FROM articles 
        WHERE articles.slug = NEW.slug 
        AND (TG_OP = 'INSERT' OR articles.id != NEW.id)
      ) THEN
        NEW.slug := public.generate_slug(NEW.title);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para INSERT e UPDATE
CREATE TRIGGER article_slug_trigger
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION public.set_article_slug();