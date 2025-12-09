import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Edit, Trash2, EyeOff, Eye, ExternalLink, Check, X } from "lucide-react";
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
}

interface PublishedArticlesProps {
  userRole?: 'admin' | 'editor';
}

const CATEGORIES = ['Todas', 'Esportes', 'Política', 'Tecnologia', 'Mundo', 'Música', 'Polícia', 'Sergipe', 'Educação', 'Policial', 'Outros'];

const PublishedArticles = ({ userRole = 'admin' }: PublishedArticlesProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [filteredPending, setFilteredPending] = useState<Article[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('published');

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    loadArticles();

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
      // Carregar artigos publicados
      const { data: publishedData, error: publishedError } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (publishedError) throw publishedError;
      setArticles(publishedData || []);

      // Carregar artigos pendentes de aprovação (só admin)
      if (isAdmin) {
        const { data: pendingData, error: pendingError } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'pending_approval')
          .eq('published', false)
          .order('created_at', { ascending: false });

        if (pendingError) throw pendingError;
        setPendingArticles(pendingData || []);
      }
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
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast.success("Artigo rejeitado!");
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

  const ArticleCard = ({ article, showApprovalButtons = false }: { article: Article; showApprovalButtons?: boolean }) => (
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
              {article.featured && (
                <Badge className="bg-gradient-primary">Destaque</Badge>
              )}
              {showApprovalButtons && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Aguardando Aprovação
                </Badge>
              )}
              {article.tags && article.tags.length > 0 && (
                article.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="secondary">{tag}</Badge>
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              {showApprovalButtons ? 'Enviado em' : 'Publicado em'} {formatDate(article.created_at)}
            </p>

            <div className="flex gap-2 flex-wrap">
              {showApprovalButtons && isAdmin ? (
                <>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(article.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar e Publicar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReject(article.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </>
              ) : (
                <>
                  {article.published && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewArticle(article.slug)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver no Portal
                    </Button>
                  )}
                  {isAdmin && (
                    <>
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
                    </>
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
          <CardTitle className="flex items-center justify-between">
            <span>Artigos {isAdmin ? '' : '(Visualização)'}</span>
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

      {isAdmin ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="published" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Publicados ({filteredArticles.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                {filteredPending.length}
              </Badge>
              Aguardando Aprovação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published">
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

          <TabsContent value="pending">
            <div className="grid gap-4">
              {filteredPending.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground text-lg">
                      Nenhum artigo aguardando aprovação.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPending.map((article) => (
                  <ArticleCard key={article.id} article={article} showApprovalButtons={true} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
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
      )}

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