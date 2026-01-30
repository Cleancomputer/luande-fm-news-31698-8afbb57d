import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VLibras from "@/components/layout/VLibras";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoArticle {
  id: string;
  title: string | null;
  subtitle: string | null;
  category: string;
  created_at: string | null;
  media_gallery: any;
}

const VideoNews = () => {
  const [videos, setVideos] = useState<VideoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, subtitle, category, created_at, media_gallery')
        .eq('published', true)
        .not('media_gallery', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter articles that have video content
      const articlesWithVideos = (data || []).filter(article => {
        if (!article.media_gallery || !Array.isArray(article.media_gallery)) return false;
        return article.media_gallery.some((media: any) => 
          media.type === 'video' || 
          (media.url && (media.url.includes('youtube') || media.url.includes('vimeo') || media.url.endsWith('.mp4')))
        );
      });

      setVideos(articlesWithVideos);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getVideoUrl = (article: VideoArticle): string | null => {
    if (!article.media_gallery || !Array.isArray(article.media_gallery)) return null;
    const video = article.media_gallery.find((media: any) => 
      media.type === 'video' || 
      (media.url && (media.url.includes('youtube') || media.url.includes('vimeo') || media.url.endsWith('.mp4')))
    );
    return video?.url || null;
  };

  const getVideoThumbnail = (url: string): string => {
    // Extract YouTube video ID and return thumbnail
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    // Default placeholder for non-YouTube videos
    return '/placeholder.svg';
  };

  const handleVideoClick = (article: VideoArticle) => {
    const videoUrl = getVideoUrl(article);
    if (videoUrl) {
      setSelectedVideo({ url: videoUrl, title: article.title });
    }
  };

  const getEmbedUrl = (url: string): string => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    }
    return url;
  };

  // Featured YouTube videos (always shown)
  const featuredVideos = [
    { id: "fizu3ynz-pk", title: "Notícias LuandêFM - Destaque 1" },
    { id: "SAotJezU9qA", title: "Notícias LuandêFM - Destaque 2" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-4">
              <span className="w-2 h-12 bg-red-600 rounded-full"></span>
              Notícias em Vídeo
            </h1>
            <p className="text-lg text-muted-foreground">
              Acompanhe as principais notícias em formato de vídeo
            </p>
          </div>

          {/* Featured Videos Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Play className="w-6 h-6 text-red-600" />
              Vídeos em Destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredVideos.map((video) => (
                <div key={video.id} className="aspect-video rounded-xl overflow-hidden shadow-lg relative">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
            </div>
          </section>

          {/* Videos from Articles */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando vídeos...</p>
              </div>
            </div>
          ) : videos.length > 0 ? (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Play className="w-6 h-6 text-primary" />
                Matérias com Vídeo
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((article) => {
                  const videoUrl = getVideoUrl(article);
                  if (!videoUrl) return null;
                  
                  return (
                    <Card 
                      key={article.id}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => handleVideoClick(article)}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={getVideoThumbnail(videoUrl)}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute top-2 left-2 bg-red-600">
                          {article.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.subtitle && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {article.subtitle}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="text-center py-12">
              <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Nenhuma matéria com vídeo encontrada no momento.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <VLibras />

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="line-clamp-2">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {selectedVideo && (
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(selectedVideo.url)}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoNews;
