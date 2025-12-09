-- Remover políticas conflitantes do storage
DROP POLICY IF EXISTS "Admins podem fazer upload de mídias" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar mídias" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar mídias" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins e editores podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins e editores podem atualizar" ON storage.objects;
DROP POLICY IF EXISTS "Admins e editores podem deletar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
DROP POLICY IF EXISTS "Mídias são publicamente acessíveis" ON storage.objects;

-- Criar políticas simples e funcionais
-- Permitir visualização pública de todos os arquivos do bucket media
CREATE POLICY "media_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Permitir upload para usuários autenticados (admin e editor)
CREATE POLICY "media_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Permitir update para usuários autenticados
CREATE POLICY "media_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Permitir delete para usuários autenticados
CREATE POLICY "media_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');