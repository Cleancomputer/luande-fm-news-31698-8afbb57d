import { Facebook, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-new.png";

const Footer = () => {
  return (
    <footer className="bg-primary mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Sobre */}
          <div>
            <img src={logo} alt="Portal Luande" className="h-14 w-auto mb-4" />
            <p className="text-sm text-primary-foreground/75 font-body leading-relaxed">
              Seu portal de notícias completo com informações sobre política, esportes, entretenimento, tecnologia e muito mais.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-primary-foreground uppercase tracking-wider font-body">Links Rápidos</h3>
            <ul className="space-y-2 text-sm font-body">
              <li><Link to="/sobre-nos" className="text-primary-foreground/75 hover:text-primary-foreground smooth-transition">Sobre Nós</Link></li>
              <li><Link to="/contato" className="text-primary-foreground/75 hover:text-primary-foreground smooth-transition">Contato</Link></li>
              <li><Link to="/politica-de-privacidade" className="text-primary-foreground/75 hover:text-primary-foreground smooth-transition">Política de Privacidade</Link></li>
              <li><Link to="/termos-de-uso" className="text-primary-foreground/75 hover:text-primary-foreground smooth-transition">Termos de Uso</Link></li>
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-primary-foreground uppercase tracking-wider font-body">Categorias</h3>
            <ul className="space-y-2 text-sm font-body">
              <li><Link to="/categoria/Política" className="text-primary-foreground/75 hover:text-primary-foreground smooth-transition">Política</Link></li>
              <li><Link to="/categoria/Esportes" className="text-primary-foreground/75 hover:text-primary-foreground smooth-transition">Esportes</Link></li>
              <li><Link to="/categoria/Entretenimento" className="text-primary-foreground/75 hover:text-primary-foreground smooth-transition">Entretenimento</Link></li>
              <li><Link to="/categoria/Tecnologia" className="text-primary-foreground/75 hover:text-primary-foreground smooth-transition">Tecnologia</Link></li>
              <li><Link to="/categoria/Policial" className="text-primary-foreground/75 hover:text-primary-foreground smooth-transition">Policial</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-primary-foreground uppercase tracking-wider font-body">Contato</h3>
            <ul className="space-y-3 text-sm font-body">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary-foreground/60 flex-shrink-0" />
                <span className="text-primary-foreground/75">Avenida 7 de junho N° 598</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-foreground/60 flex-shrink-0" />
                <span className="text-primary-foreground/75">7999801-5049</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-foreground/60 flex-shrink-0" />
                <span className="text-primary-foreground/75">comunicacao@luandefm.net</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social + Copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-primary-foreground/60 font-body">
              © 2025 Portal Luande. Todos os direitos reservados.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/LUANDEFM/?locale=pt_BR" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/20 smooth-transition" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/radioluandefm/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/20 smooth-transition" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.youtube.com/@luandefm9842" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/20 smooth-transition" aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
