import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import BreakingNews from "@/components/layout/BreakingNews";
import DateTimeBanner from "@/components/layout/DateTimeBanner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsCard from "@/components/news/NewsCard";
import NewsCarousel from "@/components/news/NewsCarousel";
import PopularNews from "@/components/widgets/PopularNews";
import Poll from "@/components/widgets/Poll";
import ChatWidget from "@/components/widgets/ChatWidget";
import ContactForm from "@/components/widgets/ContactForm";
import VLibras from "@/components/layout/VLibras";
import SubmitContent from "@/components/widgets/SubmitContent";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import EconomyWidget from "@/components/widgets/EconomyWidget";
import HoroscopeWidget from "@/components/widgets/HoroscopeWidget";
import AdSpace from "@/components/widgets/AdSpace";

const Index = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();

    // Realtime subscription for articles
    const articlesChannel = supabase
      .channel('articles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'articles'
        },
        () => {
          loadArticles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(articlesChannel);
    };
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const featured = data?.find(article => article.featured);
      setFeaturedArticle(featured);
      setArticles(data || []);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (slug: string) => {
    navigate(`/artigo/${slug}`);
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    
    return articleDate.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BreakingNews />
      <DateTimeBanner />
      <Header />
      
      <main className="flex-1">
        {/* Top Ad Space */}
        <div className="container mx-auto px-4 py-4">
          <AdSpace position="header" />
        </div>

        {/* News Carousel Section */}
        {articles.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-primary"></span>
                Destaques
              </h2>
            </div>
            <NewsCarousel 
              items={articles.slice(0, 6).map(article => ({
                title: article.title,
                excerpt: article.subtitle || article.content.substring(0, 150) + '...',
                image: article.image_url || '/placeholder.svg',
                category: article.category,
                author: 'Redação LuandêFM',
                date: formatDate(article.created_at),
                slug: article.slug
              }))}
              onArticleClick={handleArticleClick}
            />
          </section>
        )}

        {/* Hero Section */}
        {featuredArticle && (
          <section className="container mx-auto px-4 py-8">
            <div onClick={() => handleArticleClick(featuredArticle.slug)} className="cursor-pointer">
              <NewsCard
                title={featuredArticle.title}
                excerpt={featuredArticle.subtitle || featuredArticle.content.substring(0, 200) + '...'}
                image={featuredArticle.image_url || '/placeholder.svg'}
                category={featuredArticle.category}
                author="Redação LuandêFM"
                date={formatDate(featuredArticle.created_at)}
                featured
              />
            </div>
          </section>
        )}

        {/* Main Content Grid */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* News Grid */}
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-8 bg-primary"></span>
                  Últimas Notícias
                </h2>
                {articles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      Nenhuma notícia publicada ainda. Acompanhe nosso portal para as últimas atualizações!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.slice(0, 6).map((article) => (
                      <div key={article.id} onClick={() => handleArticleClick(article.slug)} className="cursor-pointer">
                        <NewsCard
                          title={article.title}
                          excerpt={article.subtitle || article.content.substring(0, 150) + '...'}
                          image={article.image_url || '/placeholder.svg'}
                          category={article.category}
                          author="Redação LuandêFM"
                          date={formatDate(article.created_at)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Section */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-8 bg-destructive"></span>
                  Vídeos em Destaque
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/i6506oIwmJE"
                      title="LuandêFM - Vídeo 1"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/fizu3ynz-pk"
                      title="LuandêFM - Vídeo 2"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 space-y-6">
              <AdSpace position="sidebar" />
              <WeatherWidget />
              <EconomyWidget />
              <HoroscopeWidget />
              <PopularNews />
              <Poll />
              <SubmitContent />
              <ContactForm />
            </aside>
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
      <VLibras />
    </div>
  );
};

export default Index;
