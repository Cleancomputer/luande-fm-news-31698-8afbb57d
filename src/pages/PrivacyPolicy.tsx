import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-foreground">Política de Privacidade</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
            <p className="text-sm text-foreground/60">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Informações que Coletamos</h2>
              <p>
                O Portal Luande coleta informações fornecidas voluntariamente pelos usuários, como nome 
                e e-mail ao enviar notícias ou mensagens através de nossos formulários de contato.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Como Usamos as Informações</h2>
              <p>As informações coletadas são utilizadas para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Responder às suas mensagens e solicitações</li>
                <li>Melhorar nossos serviços e conteúdo</li>
                <li>Enviar comunicações relevantes (quando autorizado)</li>
                <li>Analisar o uso do site para melhorias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Compartilhamento de Informações</h2>
              <p>
                Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros sem o 
                seu consentimento, exceto quando exigido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Cookies</h2>
              <p>
                Utilizamos cookies para melhorar a experiência de navegação. Você pode configurar seu 
                navegador para recusar cookies, mas isso pode afetar algumas funcionalidades do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Segurança</h2>
              <p>
                Implementamos medidas de segurança para proteger suas informações pessoais contra acesso 
                não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Links Externos</h2>
              <p>
                Nosso site pode conter links para sites externos. Não somos responsáveis pelas práticas 
                de privacidade de outros sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Seus Direitos</h2>
              <p>Você tem o direito de:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir informações incorretas</li>
                <li>Solicitar a exclusão de suas informações</li>
                <li>Retirar o consentimento para uso de dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Contato</h2>
              <p>
                Para questões sobre esta política de privacidade, entre em contato através do e-mail: 
                contato@luandefm.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Alterações</h2>
              <p>
                Esta política pode ser atualizada periodicamente. Recomendamos que você revise esta 
                página regularmente para se manter informado sobre como protegemos suas informações.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
