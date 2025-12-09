import { useState, useEffect, useRef } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Refs para inputs - cada um com propósito específico
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Flag para prevenir uploads duplicados
  const isUploadingRef = useRef(false);

  // Buscar userId na montagem
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.id) {
          setUserId(data.session.user.id);
        }
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
      }
    };
    getUser();
  }, []);

  // Carregar mídia
  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erro ao carregar mídia:', error);
        toast.error('Erro ao carregar biblioteca');
      } else {
        setMedia(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const processUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Verificar se já está fazendo upload
    if (isUploadingRef.current) {
      console.log('Upload em andamento, ignorando...');
      return;
    }

    // Buscar userId atualizado
    let currentUserId = userId;
    if (!currentUserId) {
      const { data } = await supabase.auth.getSession();
      currentUserId = data?.session?.user?.id || null;
      if (currentUserId) setUserId(currentUserId);
    }

    if (!currentUserId) {
      toast.error('Sessão expirada. Faça login novamente.');
      return;
    }

    isUploadingRef.current = true;
    setUploading(true);
    
    let successCount = 0;
    let lastUploadedMedia: SelectedMedia | null = null;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Enviando ${i + 1} de ${files.length}...`);

        // Gerar nome único
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
        const fileName = `${timestamp}_${random}.${ext}`;
        const filePath = `${currentUserId}/${fileName}`;

        // Determinar tipo MIME
        let mimeType = file.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
          const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp'];
          const videoExts = ['mp4', 'mov', 'webm', 'avi', 'm4v', 'mkv'];
          if (imageExts.includes(ext)) {
            mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          } else if (videoExts.includes(ext)) {
            mimeType = `video/${ext}`;
          }
        }

        console.log(`Upload: ${filePath}, tipo: ${mimeType}, tamanho: ${file.size}`);

        // Fazer upload para storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: mimeType
          });

        if (uploadError) {
          console.error('Erro upload:', uploadError);
          toast.error(`Erro ao enviar: ${file.name}`);
          continue;
        }

        // Obter URL pública
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;

        // Salvar no banco
        const { data: dbData, error: dbError } = await supabase
          .from('media_library')
          .insert({
            file_name: file.name || fileName,
            file_path: publicUrl,
            file_type: mimeType,
            file_size: file.size,
            mime_type: mimeType,
            uploaded_by: currentUserId
          })
          .select()
          .single();

        if (dbError) {
          console.error('Erro ao salvar no banco:', dbError);
          continue;
        }

        successCount++;
        
        // Guardar última mídia para auto-seleção
        const isVideo = mimeType.startsWith('video/');
        lastUploadedMedia = {
          url: publicUrl,
          type: isVideo ? 'video' : 'image'
        };

        console.log('Upload concluído:', dbData?.id);
      }

      if (successCount > 0) {
        toast.success(`${successCount} arquivo(s) enviado(s)!`);
        await loadMedia();
        
        // Auto-selecionar última mídia enviada
        if (onSelect && lastUploadedMedia) {
          onSelect(lastUploadedMedia);
        }
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      toast.error('Erro ao processar upload');
    } finally {
      setUploading(false);
      setUploadProgress('');
      isUploadingRef.current = false;
      
      // Limpar inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      processUpload(Array.from(fileList));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta mídia?')) return;

    try {
      const { error } = await supabase.from('media_library').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Mídia excluída!');
      setMedia(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Erro ao excluir:', err);
      toast.error('Erro ao excluir mídia');
    }
  };

  const handleSelect = (item: Media) => {
    if (!onSelect) return;

    const isImage = item.file_type?.startsWith('image/');
    const isVideo = item.file_type?.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Apenas imagens e vídeos podem ser selecionados');
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
      {/* Área de Upload */}
      <Card>
        <CardContent className="p-4">
          {/* Inputs escondidos */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple={allowMultiple}
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">{uploadProgress || 'Enviando...'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Botão principal */}
              <Button
                type="button"
                variant="default"
                className="w-full h-14 text-base font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-2" />
                Selecionar Arquivos
              </Button>

              {/* Botões para mobile */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  onClick={() => cameraInputRef.current?.click()}
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
                JPG, PNG, GIF, MP4, MOV e outros formatos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header da biblioteca */}
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

      {/* Grid de mídias */}
      {loading ? (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-lg overflow-hidden border bg-muted cursor-pointer"
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

              {/* Overlay com ações */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Nome do arquivo */}
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
