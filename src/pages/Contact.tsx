import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreakingNews from "@/components/layout/BreakingNews";
import DateTimeBanner from "@/components/layout/DateTimeBanner";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <BreakingNews />
      <DateTimeBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Contato</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">
                  Avenida 7 de junho N° 598
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-accent" />
                  Telefone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">
                  7999801-5049
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-accent" />
                  E-mail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">
                  comunicacao@luandefm.net
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <a
                    href="https://www.facebook.com/LUANDEFM/?locale=pt_BR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-accent transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.instagram.com/radioluandefm/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-accent transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.youtube.com/@luandefm9842"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-accent transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-6 w-6" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Envie Sua Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 mb-4">
                Para enviar sugestões de notícias ou entrar em contato conosco, utilize nosso 
                <a href="/enviar-noticia" className="text-accent hover:underline ml-1">
                  formulário de envio de notícias
                </a> ou entre em contato através dos canais acima.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
