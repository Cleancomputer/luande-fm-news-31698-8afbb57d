import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreakingNews from "@/components/layout/BreakingNews";
import DateTimeBanner from "@/components/layout/DateTimeBanner";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background">
      <BreakingNews />
      <DateTimeBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-foreground">Termos de Uso</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
            <p className="text-sm text-foreground/60">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar o Portal Luande, você concorda em cumprir e estar sujeito aos 
                seguintes termos e condições de uso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Uso do Conteúdo</h2>
              <p>
                Todo o conteúdo publicado no Portal Luande, incluindo textos, imagens, vídeos e 
                gráficos, é protegido por direitos autorais. É proibida a reprodução total ou parcial 
                sem autorização prévia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Responsabilidade do Usuário</h2>
              <p>Os usuários são responsáveis por:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações verdadeiras e precisas</li>
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Não usar o site para fins ilegais ou não autorizados</li>
                <li>Não publicar conteúdo ofensivo, difamatório ou que viole direitos de terceiros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Conteúdo de Terceiros</h2>
              <p>
                O Portal Luande pode incluir links para sites de terceiros. Não somos responsáveis 
                pelo conteúdo ou práticas de privacidade desses sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Limitação de Responsabilidade</h2>
              <p>
                O Portal Luande não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Interrupções ou erros no serviço</li>
                <li>Perda de dados ou conteúdo</li>
                <li>Danos diretos ou indiretos decorrentes do uso do site</li>
                <li>Precisão ou confiabilidade de conteúdo de terceiros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Envio de Conteúdo</h2>
              <p>
                Ao enviar notícias ou conteúdo para o Portal Luande, você garante que:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>É o autor original ou possui os direitos necessários</li>
                <li>O conteúdo não viola direitos de terceiros</li>
                <li>O conteúdo é verdadeiro e preciso</li>
                <li>Concede ao Portal Luande o direito de publicar e editar o conteúdo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Modificações do Serviço</h2>
              <p>
                Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, 
                o serviço (ou qualquer parte dele) com ou sem aviso prévio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Propriedade Intelectual</h2>
              <p>
                Todas as marcas, logotipos e marcas de serviço exibidos no Portal Luande são 
                propriedade do Portal Luande ou de seus respectivos proprietários.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Lei Aplicável</h2>
              <p>
                Estes termos de uso são regidos pelas leis brasileiras. Qualquer disputa será 
                submetida à jurisdição dos tribunais brasileiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Alterações dos Termos</h2>
              <p>
                O Portal Luande se reserva o direito de modificar estes termos a qualquer momento. 
                É responsabilidade do usuário revisar periodicamente estes termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Contato</h2>
              <p>
                Para dúvidas sobre estes termos de uso, entre em contato através do e-mail: 
                contato@luandefm.com
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
