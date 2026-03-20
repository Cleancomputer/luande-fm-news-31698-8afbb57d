import { useState, useEffect } from "react";
import { Menu, X, Search, Shield, Radio, ChevronRight } from "lucide-react";
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
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    const categoriesChannel = supabaseClient
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchCategories();
      })
      .subscribe();
    return () => { supabaseClient.removeChannel(categoriesChannel); };
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
      setShowSearch(false);
    }
  };

  const visibleCategories = categories.slice(0, 5);

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: Menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 text-primary-foreground hover:text-primary-foreground/80 smooth-transition"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="text-sm font-semibold hidden sm:inline font-body">Menu</span>
            </button>

            {/* Center: Logo */}
            <a href="/" className="flex items-center">
              <img src={logo} alt="Portal Luande" className="h-12 md:h-16 w-auto" />
            </a>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-1.5 text-primary-foreground hover:text-primary-foreground/80 smooth-transition p-2"
                title="Buscar"
              >
                <Search className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-body">Busca</span>
              </button>

              <a
                href="http://play.radios.com.br/13735"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary-foreground hover:text-primary-foreground/80 smooth-transition p-2"
                title="Ouvir LuandeFM Ao Vivo"
              >
                <Radio className="h-5 w-5 animate-pulse" />
                <span className="hidden sm:inline text-sm font-body">Ao Vivo</span>
              </a>

              {/* Admin link hidden for security - access via /login directly */}
            </div>
          </div>
        </div>
      </div>

      {/* Search bar dropdown */}
      {showSearch && (
        <div className="bg-background border-b border-border shadow-md">
          <div className="container mx-auto px-4 py-3">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
              <Input
                type="search"
                placeholder="Buscar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-10"
                autoFocus
              />
              <Button type="submit" size="sm" className="h-10 px-6">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Categories bar - visible categories */}
      <nav className="bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {visibleCategories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/categoria/${category.slug}`}
                  className="block px-4 py-3 text-sm font-semibold text-foreground hover:text-primary hover:bg-muted/50 smooth-transition whitespace-nowrap font-body uppercase tracking-wide"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/eventos"
                className="block px-4 py-3 text-sm font-semibold text-foreground hover:text-primary hover:bg-muted/50 smooth-transition whitespace-nowrap font-body uppercase tracking-wide"
              >
                Eventos
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Full menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[64px] md:top-[80px] z-50 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div
            className="bg-background w-full max-w-sm h-full overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search in menu */}
            <div className="p-4 border-b border-border">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="search"
                  placeholder="Buscar notícias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* All categories */}
            <div className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 font-body">
                Categorias
              </h3>
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/categoria/${category.slug}`}
                      className="flex items-center justify-between px-3 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-md smooth-transition font-body"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="font-medium">{category.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Menu links */}
            <div className="p-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 font-body">
                Portal
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/eventos" className="flex items-center justify-between px-3 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-md smooth-transition font-body" onClick={() => setIsMenuOpen(false)}>
                    <span className="font-medium">Eventos</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link to="/enviar-noticia" className="flex items-center justify-between px-3 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-md smooth-transition font-body" onClick={() => setIsMenuOpen(false)}>
                    <span className="font-medium">Enviar Notícia</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link to="/contato" className="flex items-center justify-between px-3 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-md smooth-transition font-body" onClick={() => setIsMenuOpen(false)}>
                    <span className="font-medium">Contato</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link to="/sobre-nos" className="flex items-center justify-between px-3 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-md smooth-transition font-body" onClick={() => setIsMenuOpen(false)}>
                    <span className="font-medium">Sobre Nós</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
