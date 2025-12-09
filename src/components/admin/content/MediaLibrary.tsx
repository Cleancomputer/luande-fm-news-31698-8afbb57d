import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2, Camera, Video, RefreshCw, Check } from 'lucide-react';
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
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  
  // Refs para prevenir duplicações
  const isLoadingRef = useRef(false);
  const isUploadingRef = useRef(false);
  const mountedRef = useRef(true);

  // Carregar mídia - função estável
  const loadMedia = useCallback(async () => {
    // Prevenir chamadas duplicadas
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!mountedRef.current) return;

      if (error) {
        console.error('Erro ao carregar mídia:', error);
      } else {
        setMedia(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setInitialLoaded(true);
      }
      isLoadingRef.current = false;
    }
  }, []);

  // Carregar na montagem imediatamente
  useEffect(() => {
    mountedRef.current = true;
    loadMedia();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadMedia]);

  const processUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    
    // Verificar se já está fazendo upload
    if (isUploadingRef.current) {
      console.log('Upload em andamento...');
      return;
    }

    // Buscar sessão
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;

    if (!currentUserId) {
      toast.error('Faça login novamente');
      return;
    }

    isUploadingRef.current = true;
    setUploading(true);
    
    let successCount = 0;
    let lastUploadedMedia: SelectedMedia | null = null;

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        if (!mountedRef.current) break;
        
        setUploadProgress(`Enviando ${i + 1} de ${fileArray.length}...`);

        // Nome único
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
        const fileName = `${timestamp}_${random}.${ext}`;
        const filePath = `${currentUserId}/${fileName}`;

        // Tipo MIME
        let mimeType = file.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
          const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp'];
          const videoExts = ['mp4', 'mov', 'webm', 'avi', 'm4v', 'mkv', 'flv', 'wmv', '3gp'];
          if (imageExts.includes(ext)) {
            mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          } else if (videoExts.includes(ext)) {
            mimeType = `video/${ext}`;
          }
        }

        console.log(`Upload: ${fileName}, tipo: ${mimeType}`);

        // Upload
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: mimeType
          });

        if (uploadError) {
          console.error('Erro upload:', uploadError);
          toast.error(`Erro: ${file.name}`);
          continue;
        }

        // URL pública
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;

        // Salvar no banco
        const { error: dbError } = await supabase
          .from('media_library')
          .insert({
            file_name: file.name || fileName,
            file_path: publicUrl,
            file_type: mimeType,
            file_size: file.size,
            mime_type: mimeType,
            uploaded_by: currentUserId
          });

        if (dbError) {
          console.error('Erro DB:', dbError);
          continue;
        }

        successCount++;
        
        const isVideo = mimeType.startsWith('video/');
        lastUploadedMedia = {
          url: publicUrl,
          type: isVideo ? 'video' : 'image'
        };
      }

      if (successCount > 0) {
        toast.success(`${successCount} arquivo(s) enviado(s)!`);
        await loadMedia();
        
        // Auto-selecionar
        if (onSelect && lastUploadedMedia) {
          onSelect(lastUploadedMedia);
        }
      }
    } catch (err) {
      console.error('Erro:', err);
      toast.error('Erro no upload');
    } finally {
      if (mountedRef.current) {
        setUploading(false);
        setUploadProgress('');
      }
      isUploadingRef.current = false;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUpload(files);
    }
    // Limpar input
    e.target.value = '';
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Excluir esta mídia?')) return;

    try {
      const { error } = await supabase.from('media_library').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Mídia excluída!');
      setMedia(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Erro:', err);
      toast.error('Erro ao excluir');
    }
  };

  const handleSelect = (item: Media) => {
    if (!onSelect) return;

    const isImage = item.file_type?.startsWith('image/');
    const isVideo = item.file_type?.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Selecione imagens ou vídeos');
      return;
    }

    onSelect({
      url: item.file_path,
      type: isVideo ? 'video' : 'image'
    });
    
    toast.success('Mídia selecionada!');
  };

  return (
    <div className="space-y-4">
      {/* Upload */}
      <Card>
        <CardContent className="p-4">
          {uploading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">{uploadProgress || 'Enviando...'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Input principal */}
              <label className="block">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple={allowMultiple}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex items-center justify-center w-full h-14 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors font-medium">
                  <Upload className="w-5 h-5 mr-2" />
                  Selecionar Arquivos
                </div>
              </label>

              {/* Botões mobile */}
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center w-full h-12 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <Camera className="w-4 h-4 mr-2" />
                    Tirar Foto
                  </div>
                </label>
                <label className="block">
                  <input
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center w-full h-12 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <Video className="w-4 h-4 mr-2" />
                    Gravar Vídeo
                  </div>
                </label>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                JPG, PNG, GIF, MP4, MOV e outros formatos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Biblioteca de Mídia</h3>
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

      {/* Grid */}
      {loading && !initialLoaded ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma mídia encontrada</p>
          <p className="text-xs mt-1">Faça upload de imagens ou vídeos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => handleSelect(item)}
            >
              {item.file_type?.startsWith('image/') ? (
                <img
                  src={item.file_path}
                  alt={item.file_name}
                  className="w-full h-28 sm:h-32 object-cover"
                  loading="lazy"
                />
              ) : item.file_type?.startsWith('video/') ? (
                <div className="relative w-full h-28 sm:h-32">
                  <video
                    src={item.file_path}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-28 sm:h-32 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(item);
                  }}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={(e) => handleDelete(item.id, e)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Nome */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                <p className="text-xs text-white truncate">{item.file_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
