import { useState } from "react";
import { Menu, X, Search, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";

const categories = [
  { name: "Política", href: "#politica" },
  { name: "Esportes", href: "#esportes" },
  { name: "Entretenimento", href: "#entretenimento" },
  { name: "Música", href: "#musica" },
  { name: "Tecnologia", href: "#tecnologia" },
  { name: "Cidades", href: "#cidades" },
  { name: "Mundo", href: "#mundo" }
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card shadow-lg">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center transition-transform hover:scale-105">
            <img src={logo} alt="LuandêFM" className="h-20 w-auto" />
          </a>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Input 
                type="search" 
                placeholder="Buscar notícias..." 
                className="w-full pr-12 h-12 text-base border-2 focus:border-accent"
              />
              <Button 
                size="icon" 
                className="absolute right-1 top-1 h-10 w-10 gradient-yellow-glow hover:opacity-90"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Link */}
            <Link 
              to="/login" 
              className="flex items-center gap-2 text-foreground hover:text-accent transition-colors px-3 py-2 rounded-lg hover:bg-muted"
              title="Acesso Administrativo"
            >
              <Shield className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="lg:hidden mt-4">
          <div className="relative">
            <Input 
              type="search" 
              placeholder="Buscar notícias..." 
              className="w-full pr-12 h-12 border-2 focus:border-accent"
            />
            <Button 
              size="icon" 
              className="absolute right-1 top-1 h-10 w-10 gradient-yellow-glow hover:opacity-90"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <nav className="border-t border-border/50">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center justify-center gap-2 py-4">
            {categories.map((category) => (
              <li key={category.name}>
                <a
                  href={category.href}
                  className="relative px-5 py-2.5 text-sm font-semibold text-foreground hover:text-accent smooth-transition group"
                >
                  {category.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full smooth-transition"></span>
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <ul className="lg:hidden py-4 space-y-1">
              {categories.map((category) => (
                <li key={category.name}>
                  <a
                    href={category.href}
                    className="block px-4 py-3 text-base font-medium text-foreground hover:text-accent hover:bg-muted smooth-transition rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
