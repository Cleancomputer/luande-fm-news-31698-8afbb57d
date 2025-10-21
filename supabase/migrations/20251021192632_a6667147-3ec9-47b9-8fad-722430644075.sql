-- Corrigir search_path nas funções (drop com CASCADE)
DROP TRIGGER IF EXISTS article_slug_trigger ON articles;
DROP FUNCTION IF EXISTS set_article_slug() CASCADE;
DROP FUNCTION IF EXISTS generate_slug(text) CASCADE;

CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug text;
  counter integer := 0;
  base_slug text;
BEGIN
  base_slug := lower(unaccent(title));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM articles WHERE articles.slug = slug) LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN slug;
END;
$$;

CREATE OR REPLACE FUNCTION set_article_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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