import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-foreground">Sobre Nós</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Quem Somos</h2>
              <p>
                O Portal Luande é o seu portal de notícias completo, dedicado a trazer informações 
                relevantes e atualizadas sobre os principais acontecimentos do Brasil e do mundo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Nossa Missão</h2>
              <p>
                Nossa missão é informar com credibilidade e transparência, levando até você notícias 
                verificadas sobre política, esportes, entretenimento, tecnologia, economia e muito mais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Nossos Valores</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Credibilidade:</strong> Priorizamos a veracidade das informações</li>
                <li><strong>Transparência:</strong> Somos claros e honestos em nossa cobertura</li>
                <li><strong>Diversidade:</strong> Valorizamos diferentes perspectivas</li>
                <li><strong>Compromisso:</strong> Dedicados a servir nossa comunidade</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Entre em Contato</h2>
              <p>
                Estamos sempre abertos ao diálogo com nossos leitores. Para sugestões, críticas ou 
                envio de notícias, entre em contato através de nossos canais oficiais.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
