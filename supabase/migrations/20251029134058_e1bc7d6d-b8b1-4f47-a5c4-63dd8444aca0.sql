-- Corrigir função set_article_slug removendo todos os triggers primeiro
DROP TRIGGER IF EXISTS set_article_slug_trigger ON articles;
DROP TRIGGER IF EXISTS article_slug_trigger ON articles;
DROP FUNCTION IF EXISTS public.set_article_slug() CASCADE;

CREATE OR REPLACE FUNCTION public.set_article_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER article_slug_trigger
BEFORE INSERT ON articles
FOR EACH ROW
EXECUTE FUNCTION public.set_article_slug();