import { useState, useEffect } from "react";
import { Menu, X, Search, Shield, Radio } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseClient } from "@/lib/supabase-client";
import logo from "@/assets/logo-new.png";

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();

    // Realtime subscription for categories
    const categoriesChannel = supabaseClient
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(categoriesChannel);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* Main Header */}
      <div className="bg-primary px-4 py-6">
        <div className="container mx-auto flex items-center justify-between gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center transition-transform hover:scale-105">
            <img src={logo} alt="Portal Luande" className="h-20 w-auto" />
          </a>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Input 
                type="search" 
                placeholder="Buscar notícias..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 h-12 text-base border-2 focus:border-accent"
              />
              <Button 
                type="submit"
                size="icon" 
                className="absolute right-1 top-1 h-10 w-10 gradient-yellow-glow hover:opacity-90"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-2">
            {/* Botão Rádio Ao Vivo */}
            <a 
              href="http://play.radios.com.br/13735" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary-foreground hover:text-accent transition-colors px-3 py-2 rounded-lg hover:bg-primary-foreground/10"
              title="Ouvir LuandeFM Ao Vivo"
            >
              <Radio className="h-6 w-6 sm:h-5 sm:w-5 animate-pulse" />
              <span className="hidden sm:inline text-sm font-medium">Ao Vivo</span>
            </a>

            {/* Admin Link - Visível em todos os dispositivos */}
            <Link 
              to="/login" 
              className="flex items-center gap-2 text-primary-foreground hover:text-accent transition-colors px-3 py-2 rounded-lg hover:bg-primary-foreground/10"
              title="Acesso Administrativo"
            >
              <Shield className="h-6 w-6 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="lg:hidden mt-4">
          <div className="relative">
            <Input 
              type="search" 
              placeholder="Buscar notícias..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 h-12 border-2 focus:border-accent"
            />
            <Button 
              type="submit"
              size="icon" 
              className="absolute right-1 top-1 h-10 w-10 gradient-yellow-glow hover:opacity-90"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>

      {/* Categories Navigation */}
      <nav className="bg-background/60 backdrop-blur-lg border-b border-border/30 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center justify-center gap-1 py-3">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/categoria/${category.slug}`}
                  className="relative px-4 py-3 text-foreground/90 hover:text-primary font-medium text-sm uppercase tracking-wider transition-all duration-300 hover:bg-accent/10 rounded-md group"
                >
                  {category.name}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all duration-300"></span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <ul className="lg:hidden py-4 space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/categoria/${category.slug}`}
                    className="block px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-accent/10 smooth-transition rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
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
