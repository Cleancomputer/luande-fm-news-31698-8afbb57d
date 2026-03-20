ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS image_description text,
ADD COLUMN IF NOT EXISTS journalist_name text;

ALTER TABLE public.article_versions
ADD COLUMN IF NOT EXISTS image_description text,
ADD COLUMN IF NOT EXISTS journalist_name text;