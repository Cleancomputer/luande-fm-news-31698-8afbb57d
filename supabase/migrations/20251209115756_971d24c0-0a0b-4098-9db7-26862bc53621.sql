-- Atualizar políticas de artigos para incluir editores
DROP POLICY IF EXISTS "Admins podem inserir artigos" ON public.articles;
DROP POLICY IF EXISTS "Admins podem atualizar artigos" ON public.articles;

CREATE POLICY "Admins e editores podem inserir artigos" 
ON public.articles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins e editores podem atualizar artigos" 
ON public.articles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Atualizar políticas de media_library para incluir editores
DROP POLICY IF EXISTS "Admins podem gerenciar biblioteca de mídias" ON public.media_library;

CREATE POLICY "Admins e editores podem gerenciar biblioteca de mídias" 
ON public.media_library 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Atualizar políticas de storage para o bucket media
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Admins e editores podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins e editores podem atualizar" ON storage.objects;
DROP POLICY IF EXISTS "Admins e editores podem deletar" ON storage.objects;

CREATE POLICY "Admins e editores podem fazer upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'media' AND 
  (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'editor')
  )
);

CREATE POLICY "Admins e editores podem atualizar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'media' AND 
  (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'editor')
  )
);

CREATE POLICY "Admins e editores podem deletar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'media' AND 
  (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'editor')
  )
);

-- Política para visualização pública de objetos no bucket media
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');