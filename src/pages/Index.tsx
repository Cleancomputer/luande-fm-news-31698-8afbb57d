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

import heroImage from "@/assets/news-hero.jpg";
import sportsImage from "@/assets/news-sports.jpg";
import techImage from "@/assets/news-tech.jpg";
import musicImage from "@/assets/news-music.jpg";
import politicsImage from "@/assets/news-politics.jpg";
import worldImage from "@/assets/news-world.jpg";

const Index = () => {
  const featuredNews = {
    title: "Grandes transformações marcam o início de nova era na capital",
    excerpt: "Mudanças significativas trazem esperança e renovação para milhares de moradores. Projetos ambiciosos prometem modernização e desenvolvimento sustentável para os próximos anos.",
    image: heroImage,
    category: "Destaque",
    author: "Redação LuandêFM",
    date: "Há 2 horas"
  };

  const newsItems = [
    {
      title: "Time local conquista vitória histórica em competição nacional",
      excerpt: "Com desempenho impressionante, equipe garante classificação e emociona torcedores.",
      image: sportsImage,
      category: "Esportes",
      author: "João Silva",
      date: "Há 3 horas"
    },
    {
      title: "Inovação tecnológica promete revolucionar setor de energia",
      excerpt: "Nova solução sustentável pode transformar a forma como produzimos e consumimos energia.",
      image: techImage,
      category: "Tecnologia",
      author: "Maria Santos",
      date: "Há 5 horas"
    },
    {
      title: "Festival de música reúne milhares em evento memorável",
      excerpt: "Grandes artistas se apresentam em espetáculo que celebra a cultura e diversidade musical.",
      image: musicImage,
      category: "Música",
      author: "Pedro Costa",
      date: "Há 6 horas"
    },
    {
      title: "Novas políticas públicas são anunciadas pelo governo",
      excerpt: "Medidas visam melhorar qualidade de vida e promover desenvolvimento social sustentável.",
      image: politicsImage,
      category: "Política",
      author: "Ana Ferreira",
      date: "Há 8 horas"
    },
    {
      title: "Conferência internacional debate desafios globais",
      excerpt: "Líderes mundiais se reúnem para discutir soluções para problemas que afetam todo o planeta.",
      image: worldImage,
      category: "Mundo",
      author: "Carlos Mendes",
      date: "Há 10 horas"
    },
    {
      title: "Novos investimentos em infraestrutura são anunciados",
      excerpt: "Projetos de modernização prometem melhorar mobilidade urbana e qualidade dos serviços.",
      image: heroImage,
      category: "Cidades",
      author: "Luísa Oliveira",
      date: "Há 12 horas"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <BreakingNews />
      <DateTimeBanner />
      <Header />
      
      <main className="flex-1">
        {/* News Carousel Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-primary"></span>
              Destaques
            </h2>
          </div>
          <NewsCarousel items={newsItems} />
        </section>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8">
          <NewsCard {...featuredNews} featured />
        </section>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {newsItems.map((news, index) => (
                    <NewsCard key={index} {...news} />
                  ))}
                </div>
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
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Vídeo de exemplo 1"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Vídeo de exemplo 2"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 space-y-6">
              <PopularNews />
              <Poll />
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
