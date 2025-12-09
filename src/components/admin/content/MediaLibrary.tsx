import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
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

export const MediaLibrary = ({ onSelect, allowMultiple = false }: MediaLibraryProps) => {
  const { user } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Erro ao carregar mídia:', error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user) return;

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

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

        if (dbError) throw dbError;

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
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar mídia');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'],
      'video/*': ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.m4v', '.3gp'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'],
    },
  });

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mídia?')) return;

    try {
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Mídia excluída com sucesso!');
      loadMedia();
    } catch (error) {
      console.error('Erro ao excluir mídia:', error);
      toast.error('Erro ao excluir mídia');
    }
  };

  const handleSelect = (item: Media) => {
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
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? 'Solte os arquivos aqui...'
                : 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Suporta imagens, vídeos e áudio (tamanho máximo definido pelo servidor)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((item) => (
          <Card key={item.id} className="relative group">
            <CardContent className="p-2">
              {item.file_type.startsWith('image/') ? (
                <img
                  src={item.file_path}
                  alt={item.file_name}
                  className="w-full h-32 object-cover rounded cursor-pointer"
                  onClick={() => handleSelect(item)}
                />
              ) : item.file_type.startsWith('video/') ? (
                <video
                  src={item.file_path}
                  className="w-full h-32 object-cover rounded cursor-pointer"
                  onClick={() => handleSelect(item)}
                  muted
                  controls
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs truncate mt-2">{item.file_name}</p>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(item.id, item.file_path)}
              >
                <X className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
