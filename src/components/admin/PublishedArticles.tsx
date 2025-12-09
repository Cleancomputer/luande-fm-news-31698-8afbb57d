import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Edit, Trash2, EyeOff, Eye, ExternalLink, CheckCircle, Clock } from "lucide-react";
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
  status?: string;
  author_id?: string;
}

const CATEGORIES = ['Todas', 'Esportes', 'Política', 'Tecnologia', 'Mundo', 'Música', 'Polícia', 'Outros'];

const PublishedArticles = () => {
  const { userRole } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [filteredPending, setFilteredPending] = useState<Article[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('published');

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    loadArticles();

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
          loadArticles();
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
      setFilteredPending(pendingArticles);
    } else {
      setFilteredArticles(articles.filter(article => article.category === categoryFilter));
      setFilteredPending(pendingArticles.filter(article => article.category === categoryFilter));
    }
  }, [articles, pendingArticles, categoryFilter]);

  const loadArticles = async () => {
    try {
      // Carregar TODOS os artigos publicados (independente do status)
      const { data: publishedData, error: publishedError } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (publishedError) throw publishedError;
      console.log('Artigos publicados carregados:', publishedData?.length);
      setArticles(publishedData || []);

      // Carregar artigos pendentes de aprovação
      const { data: pendingData, error: pendingError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'pending_approval')
        .eq('published', false)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;
      console.log('Artigos pendentes carregados:', pendingData?.length);
      setPendingArticles(pendingData || []);

    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
      toast.error("Erro ao carregar artigos");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ published: true, status: 'published' })
        .eq('id', id);

      if (error) throw error;

      toast.success("Artigo aprovado e publicado!");
      loadArticles();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast.error("Erro ao aprovar artigo");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: 'rejected', published: false })
        .eq('id', id);

      if (error) throw error;

      toast.success("Artigo rejeitado");
      loadArticles();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast.error("Erro ao rejeitar artigo");
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
      loadArticles();
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
      loadArticles();
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
    localStorage.setItem('editingArticle', JSON.stringify(article));
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

  const ArticleCard = ({ article, isPending = false }: { article: Article; isPending?: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
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
              {isPending && (
                <Badge className="bg-yellow-500 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Aguardando Aprovação
                </Badge>
              )}
              {article.featured && !isPending && (
                <Badge className="bg-gradient-primary">Destaque</Badge>
              )}
              {article.tags && article.tags.length > 0 && (
                article.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="secondary">{tag}</Badge>
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              {isPending ? 'Enviado em' : 'Publicado em'} {formatDate(article.created_at)}
            </p>

            <div className="flex gap-2 flex-wrap">
              {isPending ? (
                // Botões para artigos pendentes (apenas admins podem aprovar)
                <>
                  {isAdmin && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(article.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar e Publicar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(article.id)}
                      >
                        <EyeOff className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(article)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </>
              ) : (
                // Botões para artigos publicados
                <>
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
                  {isAdmin && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => openDeleteDialog(article.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <CardTitle>Gerenciamento de Artigos</CardTitle>
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="published" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Publicados ({filteredArticles.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Aguardando Aprovação ({filteredPending.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="mt-6">
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
                    <ArticleCard key={article.id} article={article} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="grid gap-4">
                {filteredPending.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground text-lg">
                        {categoryFilter === 'Todas' 
                          ? 'Nenhum artigo aguardando aprovação.' 
                          : `Nenhum artigo aguardando aprovação na categoria "${categoryFilter}".`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredPending.map((article) => (
                    <ArticleCard key={article.id} article={article} isPending />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
