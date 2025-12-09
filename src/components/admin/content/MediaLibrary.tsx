import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2, Camera, Video } from 'lucide-react';
import { toast } from 'sonner';

interface Media {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

interface SelectedMedia {
  url: string;
  type: 'image' | 'video';
}

interface MediaLibraryProps {
  onSelect?: (media: SelectedMedia) => void;
  allowMultiple?: boolean;
}

// Componente de item de mídia memorizado para performance
const MediaItem = memo(({ item, onSelect, onDelete }: { 
  item: Media; 
  onSelect: (item: Media) => void; 
  onDelete: (id: string, filePath: string) => void;
}) => {
  return (
    <Card className="relative group">
      <CardContent className="p-2">
        {item.file_type.startsWith('image/') ? (
          <img
            src={item.file_path}
            alt={item.file_name}
            className="w-full h-24 sm:h-32 object-cover rounded cursor-pointer"
            onClick={() => onSelect(item)}
            loading="lazy"
          />
        ) : item.file_type.startsWith('video/') ? (
          <div 
            className="w-full h-24 sm:h-32 bg-muted rounded flex items-center justify-center cursor-pointer relative"
            onClick={() => onSelect(item)}
          >
            <video
              src={item.file_path}
              className="w-full h-full object-cover rounded"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
              <span className="text-white text-xs font-medium">Vídeo</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-24 sm:h-32 bg-muted rounded flex items-center justify-center">
            <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
        )}
        <p className="text-xs truncate mt-1 sm:mt-2">{item.file_name}</p>
        <Button
          size="sm"
          variant="destructive"
          className="absolute top-1 right-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id, item.file_path);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
});

MediaItem.displayName = 'MediaItem';

export const MediaLibrary = memo(({ onSelect, allowMultiple = false }: MediaLibraryProps) => {
  const { user } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Erro ao carregar mídia:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress('Verificando...');
    
    // Busca sessão de forma síncrona e robusta
    let currentUserId: string | undefined;
    
    // Primeiro tenta do user em memória (mais rápido)
    if (user?.id) {
      currentUserId = user.id;
    }
    
    // Se não tem, busca do Supabase
    if (!currentUserId) {
      try {
        const { data } = await supabase.auth.getSession();
        currentUserId = data?.session?.user?.id;
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
      }
    }
    
    if (!currentUserId) {
      setUploading(false);
      setUploadProgress('');
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      return;
    }

    setUploadProgress('Preparando...');
    
    try {
      const fileArray = Array.from(files);
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Enviando ${i + 1}/${fileArray.length}...`);
        
        // Gera nome único para o arquivo
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 11);
        const originalName = file.name || 'file';
        const fileExt = originalName.split('.').pop()?.toLowerCase() || 'bin';
        const fileName = `${timestamp}_${randomStr}.${fileExt}`;
        const filePath = `${currentUserId}/${fileName}`;

        // Determina o tipo do arquivo
        let fileType = file.type;
        if (!fileType || fileType === 'application/octet-stream') {
          // Tenta inferir pelo extension
          if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(fileExt)) {
            fileType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
          } else if (['mp4', 'mov', 'webm', 'avi', 'm4v'].includes(fileExt)) {
            fileType = `video/${fileExt}`;
          }
        }

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: fileType
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Erro: ${uploadError.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('media_library')
          .insert({
            file_name: originalName,
            file_path: publicUrl,
            file_type: fileType || 'application/octet-stream',
            file_size: file.size,
            mime_type: fileType || 'application/octet-stream',
            uploaded_by: currentUserId,
          });

        if (dbError) {
          console.error('DB error:', dbError);
          toast.error(`Erro ao salvar: ${dbError.message}`);
          continue;
        }

        // Auto-select se callback fornecido
        if (onSelect) {
          const isImage = fileType?.startsWith('image/');
          const isVideo = fileType?.startsWith('video/');
          if (isImage || isVideo) {
            onSelect({
              url: publicUrl,
              type: isVideo ? 'video' : 'image',
            });
          }
        }
      }

      toast.success('Mídia enviada com sucesso!');
      loadMedia();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error?.message || 'Erro ao enviar mídia');
    } finally {
      setUploading(false);
      setUploadProgress('');
      // Limpa os inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  }, [user, onSelect, loadMedia]);

  const handleDelete = useCallback(async (id: string, filePath: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mídia?')) return;

    try {
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Mídia excluída com sucesso!');
      setMedia(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Erro ao excluir mídia:', error);
      toast.error('Erro ao excluir mídia');
    }
  }, []);

  const handleSelect = useCallback((item: Media) => {
    if (!onSelect) return;

    const isImage = item.file_type.startsWith('image/');
    const isVideo = item.file_type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Apenas imagens e vídeos podem ser adicionados ao artigo.');
      return;
    }

    const selected: SelectedMedia = {
      url: item.file_path,
      type: isVideo ? 'video' : 'image',
    };

    onSelect(selected);
  }, [onSelect]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          {/* Input geral para arquivos */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFileUpload(e.target.files);
            }}
          />
          
          {/* Input para fotos - sem capture para melhor compatibilidade iPhone */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFileUpload(e.target.files);
            }}
          />
          
          {/* Input para vídeos - sem capture para melhor compatibilidade iPhone */}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFileUpload(e.target.files);
            }}
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">{uploadProgress || 'Enviando...'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Botão principal de upload */}
              <Button
                type="button"
                variant="default"
                className="w-full h-14 text-base"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-2" />
                Selecionar Arquivo
              </Button>
              
              {/* Botões específicos para mobile */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Tirar Foto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Gravar Vídeo
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Suporta imagens (JPG, PNG, GIF) e vídeos (MP4, MOV, etc.)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {media.map((item) => (
            <MediaItem 
              key={item.id} 
              item={item} 
              onSelect={handleSelect} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
      
      {!loading && media.length === 0 && (
        <p className="text-center text-muted-foreground py-4 text-sm">
          Nenhuma mídia encontrada
        </p>
      )}
    </div>
  );
});

MediaLibrary.displayName = 'MediaLibrary';
