import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Film, Camera, Video } from 'lucide-react';
import { toast } from 'sonner';
import * as tus from 'tus-js-client';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const uploadFileResumable = (file: File, filePath: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          reject(new Error('Não autenticado'));
          return;
        }

        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 
          new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0];

        const upload = new tus.Upload(file, {
          endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${session.access_token}`,
            'x-upsert': 'true',
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          chunkSize: 6 * 1024 * 1024,
          metadata: {
            bucketName: 'media',
            objectName: filePath,
            contentType: file.type,
            cacheControl: '3600',
          },
          onError: (error) => {
            console.error('TUS upload error:', error);
            reject(error);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
            setUploadProgress(percentage);
          },
          onSuccess: () => {
            resolve();
          },
        });

        const previousUploads = await upload.findPreviousUploads();
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        upload.start();
      } catch (error) {
        reject(error);
      }
    });
  };

  const uploadFileStandard = async (file: File, filePath: string) => {
    const { error } = await supabase.storage
      .from('media')
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!user) return;

    const fileArray = Array.from(files);
    setUploading(true);
    setUploadProgress(0);

    try {
      for (const file of fileArray) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const isVideo = file.type.startsWith('video/');
        const isLargeFile = file.size > 6 * 1024 * 1024;

        // Use resumable upload for videos or large files
        if (isVideo || isLargeFile) {
          toast.info(`Enviando ${file.name}... (${Math.round(file.size / 1024 / 1024)}MB)`);
          await uploadFileResumable(file, filePath);
        } else {
          await uploadFileStandard(file, filePath);
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

        if (dbError) throw dbError;
      }

      toast.success('Mídia enviada com sucesso!');
      loadMedia();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(`Erro ao enviar mídia: ${error?.message || 'Tente novamente'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

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
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* General file picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-20 flex flex-col gap-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs">Selecionar Arquivo</span>
              </Button>

              {/* Camera/photo capture for mobile */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-20 flex flex-col gap-1"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs">Tirar Foto</span>
              </Button>

              {/* Video capture for mobile */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-20 flex flex-col gap-1"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading}
              >
                <Video className="h-6 w-6" />
                <span className="text-xs">Gravar Vídeo</span>
              </Button>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Enviando... {uploadProgress}%
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Suporta imagens, vídeos até 150MB (qualquer formato/duração) e áudio
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
                <div
                  className="w-full h-32 rounded cursor-pointer relative overflow-hidden bg-black"
                  onClick={() => handleSelect(item)}
                >
                  <video
                    src={item.file_path}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      video.currentTime = 1;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Film className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1 rounded">Vídeo</span>
                </div>
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
