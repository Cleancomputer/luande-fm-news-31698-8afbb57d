import { useState, useEffect, useCallback, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer upload');
      return;
    }

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('media_library')
          .insert({
            file_name: file.name,
            file_path: publicUrl,
            file_type: file.type,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
          });

        if (dbError) {
          console.error('DB error:', dbError);
          throw dbError;
        }

        // Auto-select the uploaded media if onSelect is provided
        if (onSelect) {
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
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
    }
  }, [user, onSelect, loadMedia]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'],
      'video/*': ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.m4v', '.3gp'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'],
    },
    noClick: false,
    noKeyboard: false,
  });

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
        <CardContent className="p-4 sm:p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Enviando...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Solte os arquivos aqui...'
                    : 'Toque para selecionar ou arraste arquivos'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
                  Suporta imagens e vídeos
                </p>
              </>
            )}
          </div>
          
          {/* Botão extra para mobile */}
          <Button
            type="button"
            variant="outline"
            className="w-full mt-3 sm:hidden"
            onClick={open}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar Arquivo
          </Button>
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
