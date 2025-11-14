-- Create table for user content submissions
CREATE TABLE public.user_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  description TEXT NOT NULL,
  media_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'rewarded')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit content
CREATE POLICY "Anyone can submit content" 
ON public.user_submissions 
FOR INSERT 
WITH CHECK (true);

-- Policy: Only authenticated users can view submissions
CREATE POLICY "Authenticated users can view all submissions" 
ON public.user_submissions 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update submissions (for admin)
CREATE POLICY "Authenticated users can update submissions" 
ON public.user_submissions 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create categories table for dynamic category management
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active categories
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true OR auth.role() = 'authenticated');

-- Policy: Only authenticated users can manage categories
CREATE POLICY "Authenticated users can manage categories" 
ON public.categories 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Insert existing categories
INSERT INTO public.categories (name, slug, display_order, is_active) VALUES
  ('Política', 'politica', 1, true),
  ('Policial', 'policial', 2, true),
  ('Esportes', 'esportes', 3, true),
  ('Entretenimento', 'entretenimento', 4, true),
  ('Música', 'musica', 5, true),
  ('Tecnologia', 'tecnologia', 6, true),
  ('Cidades', 'cidades', 7, true),
  ('Mundo', 'mundo', 8, true),
  ('Sergipe', 'sergipe', 9, true),
  ('Educação', 'educacao', 10, true),
  ('Acidente', 'acidente', 11, true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_submissions_updated_at
BEFORE UPDATE ON public.user_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();