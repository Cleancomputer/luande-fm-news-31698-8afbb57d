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

        {/* YouTube Live Player */}
        <section className="container mx-auto px-4 py-6">
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/live_stream?channel=UCvosUrZ89ajMHNWNWNwBngg&autoplay=1&mute=0"
                title="Portal Luande - Ao Vivo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="p-4 bg-red-600 text-white">
              <h3 className="text-xl font-bold">🔴 Assista Ao Vivo - Portal Luande FM</h3>
              <p className="text-sm opacity-90">Acompanhe nossa programação ao vivo no YouTube</p>
            </div>
          </div>
        </section>
        
        {/* Top Ad Space */}
        <div className="container mx-auto px-4 py-4">
          <AdSpace position="header" />
        </div>

        {/* News Carousel Section */}
        {articles.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <span className="gradient-text">Em Destaque</span>
              </h2>
            </div>
            <NewsCarousel items={articles.slice(0, 5).map(a => ({
              title: a.title,
              excerpt: a.subtitle || '',
              image: a.image_url || '',
              category: a.category,
              author: 'Portal Luande',
              date: formatDate(a.created_at)
            }))} />
          </section>
        )}

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* News Grid - Últimas Notícias */}
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-2xl font-bold mb-4">Últimas Notícias</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {articles.slice(5, 13).map((article) => (
                  <NewsCard
                    key={article.id}
                    title={article.title}
                    excerpt={article.subtitle || ''}
                    image={article.image_url || ''}
                    category={article.category}
                    author="Portal Luande"
                    date={formatDate(article.created_at)}
                  />
                ))}
              </div>

              {articles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Nenhum artigo publicado no momento.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <WeatherWidget />
              <EconomyWidget />
              <HoroscopeWidget />
              <ContactForm />
              <Poll />
              <PopularNews />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
      <VLibras />
    </div>
  );
};

export default Index;
