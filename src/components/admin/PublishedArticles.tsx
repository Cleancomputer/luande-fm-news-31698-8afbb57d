import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Trash2, EyeOff, Eye, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  category: string;
  image_url?: string;
  published: boolean;
  slug: string;
  created_at: string;
  featured: boolean;
  tags: string[];
}

const CATEGORIES = ['Todas', 'Esportes', 'Política', 'Tecnologia', 'Mundo', 'Música', 'Polícia', 'Outros'];

const PublishedArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublishedArticles();

    // Realtime subscription
    const articlesChannel = supabase
      .channel('published-articles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'articles'
        },
        () => {
          loadPublishedArticles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(articlesChannel);
    };
  }, []);

  useEffect(() => {
    if (categoryFilter === 'Todas') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(article => article.category === categoryFilter));
    }
  }, [articles, categoryFilter]);

  const loadPublishedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setArticles(data || []);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
      toast.error("Erro ao carregar artigos publicados");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ published: false, status: 'draft' })
        .eq('id', id);

      if (error) throw error;

      toast.success("Artigo despublicado com sucesso!");
      loadPublishedArticles();
    } catch (error) {
      console.error('Erro ao despublicar:', error);
      toast.error("Erro ao despublicar artigo");
    }
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleToDelete);

      if (error) throw error;

      toast.success("Artigo excluído com sucesso!");
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      loadPublishedArticles();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error("Erro ao excluir artigo");
    }
  };

  const openDeleteDialog = (id: string) => {
    setArticleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (article: Article) => {
    // Salvar artigo no localStorage para edição
    localStorage.setItem('editingArticle', JSON.stringify(article));
    
    // Redirecionar para a página de conteúdo
    toast.success('Carregando artigo para edição...');
    window.location.href = '/admin/content';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewArticle = (slug: string) => {
    window.open(`/artigo/${slug}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando artigos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Artigos Publicados no Portal</span>
            <Badge variant="secondary" className="text-lg">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'artigo' : 'artigos'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Label htmlFor="category-filter">Filtrar por Categoria:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                {categoryFilter === 'Todas' 
                  ? 'Nenhum artigo publicado ainda.' 
                  : `Nenhum artigo publicado na categoria "${categoryFilter}".`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {article.image_url && (
                    <div className="flex-shrink-0">
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1">{article.title}</h3>
                        {article.subtitle && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {article.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{article.category}</Badge>
                      {article.featured && (
                        <Badge className="bg-gradient-primary">Destaque</Badge>
                      )}
                      {article.tags && article.tags.length > 0 && (
                        article.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-4">
                      Publicado em {formatDate(article.created_at)}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => viewArticle(article.slug)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver no Portal
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUnpublish(article.id)}
                      >
                        <EyeOff className="w-4 h-4 mr-2" />
                        Despublicar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => openDeleteDialog(article.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O artigo será permanentemente excluído do portal e do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PublishedArticles;
