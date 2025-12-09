import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from './RichTextEditor';
import { MediaLibrary } from './MediaLibrary';

interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: string;
  image_url: string | null;
  published: boolean;
  featured: boolean;
  tags: string[] | null;
  slug: string;
  media_gallery: any;
}

const ContentManager = () => {
  const { user, userRole } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category: '',
    image_url: '',
    published: false,
    featured: false,
    tags: [] as string[],
    slug: '',
    media_gallery: [] as any[],
    cover_image_index: 0
  });

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([loadArticles(), loadCategories()]);
      setLoading(false);
    };
    
    // Verificar se há um artigo sendo editado no localStorage
    const editingArticle = localStorage.getItem('editingArticle');
    if (editingArticle) {
      try {
        const article = JSON.parse(editingArticle);
        setEditingId(article.id);
        setFormData({
          title: article.title,
          subtitle: article.subtitle || '',
          content: article.content,
          category: article.category,
          image_url: article.image_url || '',
          published: article.published,
          featured: article.featured,
          tags: article.tags || [],
          slug: article.slug,
          media_gallery: article.media_gallery || [],
          cover_image_index: 0
        });
        localStorage.removeItem('editingArticle');
      } catch (e) {
        console.error('Erro ao carregar artigo do localStorage:', e);
      }
    }
    
    loadInitialData();

    // Realtime subscription for categories only (articles são carregados manualmente)
    const categoriesChannel = supabase
      .channel('categories-content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, loadCategories)
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
    };
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }, []);

  const loadArticles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, subtitle, content, category, image_url, published, featured, tags, slug, media_gallery')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
    }
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado para publicar');
      return;
    }

    setSubmitting(true);

    const slug = formData.slug || generateSlug(formData.title);
    
    // Definir a imagem de capa (image_url) baseada na media_gallery
    let coverImageUrl = formData.image_url || '';
    if (formData.media_gallery && formData.media_gallery.length > 0) {
      const coverIndex = formData.cover_image_index ?? 0;
      const coverMedia = formData.media_gallery[coverIndex];
      if (coverMedia && coverMedia.type === 'image') {
        coverImageUrl = coverMedia.url;
      }
    }
    
    // Se for editor e está publicando, enviar para aprovação
    const isEditor = userRole === 'editor';
    const isPublishing = formData.published;
    
    let finalPublished = formData.published;
    let finalStatus = formData.published ? 'published' : 'draft';
    
    if (isEditor && isPublishing && !editingId) {
      finalPublished = false;
      finalStatus = 'pending_approval';
    }
    
    const articleData = { 
      title: formData.title,
      subtitle: formData.subtitle,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      featured: formData.featured,
      slug, 
      author_id: user.id,
      image_url: coverImageUrl,
      media_gallery: formData.media_gallery || [],
      published: finalPublished,
      status: finalStatus
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Artigo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);

        if (error) throw error;
        if (finalStatus === 'pending_approval') {
          toast.success('Artigo enviado para aprovação!');
        } else {
          toast.success('Artigo criado com sucesso!');
        }
      }

      resetForm();
      loadArticles();
    } catch (error: any) {
      console.error('Erro ao salvar artigo:', error);
      toast.error(error?.message || 'Erro ao salvar artigo');
    } finally {
      setSubmitting(false);
    }
  }, [formData, user, userRole, editingId, loadArticles]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Artigo excluído com sucesso!');
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Erro ao excluir artigo:', error);
      toast.error('Erro ao excluir artigo');
    }
  }, []);

  const handleEdit = useCallback((article: Article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      subtitle: article.subtitle || '',
      content: article.content,
      category: article.category,
      image_url: article.image_url || '',
      published: article.published,
      featured: article.featured,
      tags: article.tags || [],
      slug: article.slug,
      media_gallery: article.media_gallery || [],
      cover_image_index: 0
    });
    // Scroll para o topo do formulário no mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      content: '',
      category: '',
      image_url: '',
      published: false,
      featured: false,
      tags: [],
      slug: '',
      media_gallery: [],
      cover_image_index: 0
    });
  }, []);

  const handleMediaSelect = useCallback((media: { url: string; type: 'image' | 'video' }) => {
    setFormData(prev => ({ 
      ...prev, 
      media_gallery: [...prev.media_gallery, media]
    }));
    setShowMediaLibrary(false);
  }, []);

  const handleRemoveMedia = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      media_gallery: prev.media_gallery.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSetCoverImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      cover_image_index: index,
      image_url: prev.media_gallery[index]?.url || ''
    }));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Editar Artigo' : 'Novo Artigo'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título do artigo"
                required
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Subtítulo do artigo"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Galeria de Mídia (até 3 itens)</Label>
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMediaLibrary(true)}
                  disabled={formData.media_gallery.length >= 3}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {formData.media_gallery.length === 0 
                    ? 'Adicionar Mídia' 
                    : `Adicionar Mídia (${formData.media_gallery.length}/3)`}
                </Button>
                
                {formData.media_gallery.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    {formData.media_gallery.map((media: any, index: number) => (
                      <div key={index} className="relative group">
                        <img 
                          src={media.url} 
                          alt={`Mídia ${index + 1}`}
                          className={`w-full h-24 sm:h-32 object-cover rounded-lg border-2 ${
                            index === formData.cover_image_index 
                              ? 'border-primary' 
                              : 'border-border'
                          }`}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1 sm:gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetCoverImage(index)}
                            className="text-xs px-2 py-1 h-auto"
                          >
                            {index === formData.cover_image_index ? 'Capa' : 'Capa'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveMedia(index)}
                            className="h-auto p-1 sm:p-2"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                        {index === formData.cover_image_index && (
                          <Badge className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-primary text-xs">
                            Capa
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="content">Conteúdo *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="url-do-artigo"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label htmlFor="published">Publicado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Destaque</Label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting} className="flex-1 sm:flex-none">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>{editingId ? 'Atualizar' : 'Criar'} Artigo</>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowPreview(true)} className="flex-1 sm:flex-none">
                Preview
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Artigos */}
      <Card>
        <CardHeader>
          <CardTitle>Artigos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {article.category} • {article.published ? 'Publicado' : 'Rascunho'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(article.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {articles.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum artigo encontrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Biblioteca de Mídia</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMediaLibrary(false)}>
                <Plus className="rotate-45 w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <MediaLibrary onSelect={handleMediaSelect} />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background z-10">
              <h2 className="text-xl font-bold">Preview do Artigo</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <Plus className="rotate-45 w-5 h-5" />
              </Button>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <Badge className="mb-4">{formData.category || 'Sem categoria'}</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {formData.title || 'Título do artigo'}
                </h1>
                {formData.subtitle && (
                  <p className="text-xl text-muted-foreground mb-6">
                    {formData.subtitle}
                  </p>
                )}
              </div>

              {/* Galeria de Mídia */}
              {formData.media_gallery && formData.media_gallery.length > 0 && (
                <div className="mb-8">
                  {formData.media_gallery.length === 1 ? (
                    <img
                      src={formData.media_gallery[0].url}
                      alt={formData.title || 'Imagem do artigo'}
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.media_gallery.map((media: any, index: number) => (
                        <div key={index} className="relative">
                          {media.type === 'video' ? (
                            <video
                              src={media.url}
                              controls
                              className="w-full h-auto rounded-lg"
                            />
                          ) : (
                            <img
                              src={media.url}
                              alt={`Mídia ${index + 1}`}
                              className="w-full h-auto rounded-lg"
                            />
                          )}
                          {index === formData.cover_image_index && (
                            <Badge className="absolute top-2 left-2 bg-primary">
                              Capa
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div 
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: formData.content || '<p>Sem conteúdo</p>' }}
              />

              {formData.tags && formData.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-sm font-semibold mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
