import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import WeatherWidget from "@/components/widgets/WeatherWidget";
import { Button } from "@/components/ui/button";
import EconomyWidget from "@/components/widgets/EconomyWidget";
import HoroscopeWidget from "@/components/widgets/HoroscopeWidget";
import AdSpace from "@/components/widgets/AdSpace";
import appPromo from "@/assets/app-promo.png";

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
        .order('created_at', { ascending: false});

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
        {/* Submit News Button */}
        <section className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 py-4 shadow-lg">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <Link to="/enviar-noticia">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-bold px-8 py-4"
              >
                Nos Envie Sua Notícia
              </Button>
            </Link>
          </div>
        </section>
        
        {/* Top Ad Space */}
        <div className="container mx-auto px-4 py-4">
          <AdSpace position="header" />
        </div>

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Featured Articles */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Carousel */}
              {articles.length > 0 && (
                <NewsCarousel 
                  items={articles.slice(0, 5).map(article => ({
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
              )}

              {/* YouTube Mini Player - Mobile Only (below carousel, above latest news) */}
              <div className="lg:hidden">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-600"></span>
                  Ao Vivo
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg mb-6">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/live_stream?channel=UCS35bHapJqRtfG9kcq9f9FA&autoplay=0&mute=0"
                    title="LuandeFM Ao Vivo - Mobile"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* App Promo Banner */}
              <div className="mb-8">
                <img 
                  src={appPromo} 
                  alt="Portal Luandê App - Em breve"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Latest News Section */}
              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-10 bg-primary"></span>
                  Últimas Notícias
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.slice(5, 13).map((article) => (
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
              </div>
            </div>

            {/* Right Column - Widgets + Mini Player */}
            <div className="space-y-6">
              {/* YouTube Mini Player - Desktop Only - Fixed Sticky */}
              <div className="hidden lg:block sticky top-4 z-10">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-600"></span>
                  Ao Vivo
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg mb-6">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/live_stream?channel=UCS35bHapJqRtfG9kcq9f9FA&autoplay=0&mute=0"
                    title="LuandeFM Ao Vivo - Mini"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              <PopularNews />
              <WeatherWidget />
              <Poll />
              <HoroscopeWidget />
              <EconomyWidget />
              <ContactForm />
              <ChatWidget />
            </div>
          </div>
        </div>

        {/* YouTube Featured Videos Section */}
        <section className="container mx-auto px-4 mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-red-600"></span>
            Vídeos em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/fizu3ynz-pk"
                title="Vídeo em Destaque 1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/SAotJezU9qA"
                title="Vídeo em Destaque 2"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        {/* Bottom Ad Space */}
        <div className="container mx-auto px-4 py-4">
          <AdSpace position="footer" />
        </div>
      </main>

      <Footer />
      <VLibras />
    </div>
  );
};

export default Index;
