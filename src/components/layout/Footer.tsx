import { Facebook, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo-new.png";

const Footer = () => {
  return (
    <footer className="bg-primary border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Sobre */}
          <div>
            <img src={logo} alt="Portal Luande" className="h-16 w-auto mb-4" />
          <p className="text-sm text-white/80">
            Seu portal de notícias completo com informações sobre política, esportes, entretenimento, tecnologia e muito mais.
          </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary-foreground">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-white/80 hover:text-accent smooth-transition">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-accent smooth-transition">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-accent smooth-transition">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-accent smooth-transition">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary-foreground">Categorias</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-white/80 hover:text-accent smooth-transition">
                  Política
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-accent smooth-transition">
                  Esportes
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-accent smooth-transition">
                  Entretenimento
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-accent smooth-transition">
                  Tecnologia
                </a>
              </li>
              <li>
                <a href="/categoria/Policial" className="text-white/80 hover:text-accent smooth-transition">
                  Policial
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary-foreground">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <span className="text-white/80">
                  Avenida 7 de junho N° 598
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-white/80">7999801-5049</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-white/80">contato@luandefm.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/80">
              © 2025 Portal Luande. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/LUANDEFM/?locale=pt_BR"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-secondary smooth-transition"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/radioluandefm/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-secondary smooth-transition"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@luandefm9842"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-secondary smooth-transition"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
