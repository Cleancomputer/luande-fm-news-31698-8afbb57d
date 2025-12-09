import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2, Camera, Video, RefreshCw } from 'lucide-react';
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

// Função para obter o userId de forma robusta
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
    return data?.session?.user?.id || null;
  } catch (err) {
    console.error('Exceção ao obter sessão:', err);
    return null;
  }
}

export const MediaLibrary = memo(({ onSelect, allowMultiple = false }: MediaLibraryProps) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao carregar mídia:', error);
        toast.error('Erro ao carregar biblioteca de mídia');
        return;
      }
      setMedia(data || []);
    } catch (error) {
      console.error('Erro ao carregar mídia:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Prevenir uploads duplicados
    if (uploadingRef.current) {
      console.log('Upload já em andamento, ignorando...');
      return;
    }
    
    uploadingRef.current = true;
    setUploading(true);
    setUploadProgress('Verificando sessão...');
    
    try {
      // Busca userId diretamente do Supabase
      const currentUserId = await getCurrentUserId();
      
      if (!currentUserId) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        return;
      }

      setUploadProgress('Preparando arquivos...');
      
      const fileArray = Array.from(files);
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Enviando ${i + 1}/${fileArray.length}...`);
        
        try {
          // Gera nome único para o arquivo
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 11);
          const originalName = file.name || `file_${timestamp}`;
          const fileExt = originalName.split('.').pop()?.toLowerCase() || 'bin';
          const fileName = `${timestamp}_${randomStr}.${fileExt}`;
          const filePath = `${currentUserId}/${fileName}`;

          // Determina o tipo do arquivo
          let fileType = file.type;
          if (!fileType || fileType === '' || fileType === 'application/octet-stream') {
            const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'tiff', 'svg'];
            const videoExts = ['mp4', 'mov', 'webm', 'avi', 'm4v', 'mkv', 'flv', 'wmv', '3gp'];
            
            if (imageExts.includes(fileExt)) {
              fileType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
            } else if (videoExts.includes(fileExt)) {
              fileType = `video/${fileExt}`;
            } else {
              fileType = 'application/octet-stream';
            }
          }

          console.log(`Uploading: ${filePath}, type: ${fileType}, size: ${file.size}`);

          // Upload para o storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: fileType
            });

          if (uploadError) {
            console.error('Erro no upload:', uploadError);
            errorCount++;
            continue;
          }

          console.log('Upload concluído:', uploadData);

          // Obter URL pública
          const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

          const publicUrl = urlData.publicUrl;
          console.log('URL pública:', publicUrl);

          // Salvar no banco
          const { data: dbData, error: dbError } = await supabase
            .from('media_library')
            .insert({
              file_name: originalName,
              file_path: publicUrl,
              file_type: fileType,
              file_size: file.size,
              mime_type: fileType,
              uploaded_by: currentUserId,
            })
            .select()
            .single();

          if (dbError) {
            console.error('Erro ao salvar no banco:', dbError);
            errorCount++;
            continue;
          }

          console.log('Salvo no banco:', dbData);
          successCount++;

          // Auto-seleciona se callback fornecido
          if (onSelect && dbData) {
            const isImage = fileType.startsWith('image/');
            const isVideo = fileType.startsWith('video/');
            if (isImage || isVideo) {
              onSelect({
                url: publicUrl,
                type: isVideo ? 'video' : 'image',
              });
            }
          }
        } catch (fileError) {
          console.error('Erro no arquivo:', file.name, fileError);
          errorCount++;
        }
      }

      // Feedback final
      if (successCount > 0) {
        toast.success(`${successCount} arquivo(s) enviado(s) com sucesso!`);
        await loadMedia();
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} arquivo(s) falharam no upload`);
      }
    } catch (error: any) {
      console.error('Erro geral no upload:', error);
      toast.error(error?.message || 'Erro ao enviar mídia');
    } finally {
      setUploading(false);
      setUploadProgress('');
      uploadingRef.current = false;
      
      // Limpa os inputs de forma segura
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  }, [onSelect, loadMedia]);

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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

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
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            onChange={handleInputChange}
          />
          
          {/* Input para fotos */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            onChange={handleInputChange}
          />
          
          {/* Input para vídeos */}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            onChange={handleInputChange}
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
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
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
                  onClick={() => {
                    if (imageInputRef.current) {
                      imageInputRef.current.click();
                    }
                  }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Foto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  onClick={() => {
                    if (videoInputRef.current) {
                      videoInputRef.current.click();
                    }
                  }}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Vídeo
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Suporta imagens (JPG, PNG, GIF) e vídeos (MP4, MOV, etc.)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header com botão de refresh */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Biblioteca de Mídia</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={loadMedia}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

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