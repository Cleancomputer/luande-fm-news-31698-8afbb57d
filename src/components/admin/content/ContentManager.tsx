import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Upload, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from './RichTextEditor';
import { MediaLibrary } from './MediaLibrary';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface FormData {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  image_url: string;
  published: boolean;
  featured: boolean;
  tags: string[];
  slug: string;
  media_gallery: any[];
  cover_image_index: number;
}

const initialFormData: FormData = {
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
};

const ContentManager = () => {
  const { userRole } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // Ref para conteúdo - será atualizada pelo editor
  const contentRef = useRef('');
  
  // Sincronizar contentRef quando formData.content muda
  useEffect(() => {
    contentRef.current = formData.content;
  }, [formData.content]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([loadArticles(), loadCategories()]);
      setLoading(false);
    };
    
    // Verificar artigo em edição no localStorage
    const editingArticle = localStorage.getItem('editingArticle');
    if (editingArticle) {
      try {
        const article = JSON.parse(editingArticle);
        setEditingId(article.id);
        const newFormData = {
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
        };
        setFormData(newFormData);
        localStorage.removeItem('editingArticle');
      } catch (e) {
        console.error('Erro ao carregar artigo:', e);
      }
    }
    
    loadInitialData();

    // Subscription para categorias
    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, loadCategories)
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
    };
  }, []);

  const loadCategories = async () => {
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
  };

  const loadArticles = async () => {
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
  };

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

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData(initialFormData);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir múltiplos cliques
    if (submitting) {
      console.log('Já está salvando...');
      return;
    }

    // Capturar dados atuais - usar contentRef para conteúdo mais recente
    const currentContent = contentRef.current || formData.content;
    const currentData = {
      ...formData,
      content: currentContent
    };

    // Validações
    if (!currentData.title.trim()) {
      toast.error('Digite o título do artigo');
      return;
    }
    if (!currentData.category) {
      toast.error('Selecione uma categoria');
      return;
    }
    
    // Verificar conteúdo vazio
    const cleanContent = currentData.content.replace(/<[^>]*>/g, '').trim();
    if (!cleanContent) {
      toast.error('O conteúdo não pode estar vazio');
      return;
    }

    setSubmitting(true);

    try {
      // Buscar sessão atualizada
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session?.user?.id) {
        toast.error('Sessão expirada. Faça login novamente.');
        setSubmitting(false);
        return;
      }

      const currentUserId = sessionData.session.user.id;
      const slug = currentData.slug || generateSlug(currentData.title);
      
      // Definir imagem de capa
      let coverImageUrl = currentData.image_url || '';
      if (currentData.media_gallery.length > 0) {
        const coverIndex = currentData.cover_image_index ?? 0;
        const coverMedia = currentData.media_gallery[coverIndex];
        if (coverMedia?.type === 'image') {
          coverImageUrl = coverMedia.url;
        }
      }
      
      // Lógica de aprovação para editores
      const isEditor = userRole === 'editor';
      const isPublishing = currentData.published;
      
      let finalPublished = currentData.published;
      let finalStatus = currentData.published ? 'published' : 'draft';
      
      if (isEditor && isPublishing && !editingId) {
        finalPublished = false;
        finalStatus = 'pending_approval';
      }
      
      const articleData = { 
        title: currentData.title.trim(),
        subtitle: currentData.subtitle.trim(),
        content: currentData.content,
        category: currentData.category,
        tags: currentData.tags,
        featured: currentData.featured,
        slug, 
        author_id: currentUserId,
        image_url: coverImageUrl,
        media_gallery: currentData.media_gallery || [],
        published: finalPublished,
        status: finalStatus
      };

      console.log('Salvando artigo:', articleData.title);

      let saveError = null;

      if (editingId) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingId);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);
        saveError = error;
      }
      
      if (saveError) {
        console.error('Erro ao salvar:', saveError);
        toast.error(saveError.message || 'Erro ao salvar artigo');
        setSubmitting(false);
        return;
      }
      
      // Sucesso
      if (editingId) {
        toast.success('Artigo atualizado!');
      } else if (finalStatus === 'pending_approval') {
        toast.success('Artigo enviado para aprovação!');
      } else {
        toast.success('Artigo publicado!');
      }

      resetForm();
      await loadArticles();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(error?.message || 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este artigo?')) return;

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Artigo excluído!');
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    const newFormData = {
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
    };
    setFormData(newFormData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMediaSelect = (media: { url: string; type: 'image' | 'video' }) => {
    setFormData(prev => {
      const updated = { 
        ...prev, 
        media_gallery: [...prev.media_gallery, media]
      };
      return updated;
    });
    setShowMediaLibrary(false);
  };

  const handleRemoveMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media_gallery: prev.media_gallery.filter((_, i) => i !== index),
      cover_image_index: prev.cover_image_index >= index ? Math.max(0, prev.cover_image_index - 1) : prev.cover_image_index
    }));
  };

  const handleSetCoverImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cover_image_index: index,
      image_url: prev.media_gallery[index]?.url || ''
    }));
  };

  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            {/* Título */}
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormField('title', e.target.value)}
                placeholder="Título do artigo"
                required
              />
            </div>

            {/* Subtítulo */}
            <div>
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => updateFormField('subtitle', e.target.value)}
                placeholder="Subtítulo do artigo"
              />
            </div>

            {/* Categoria */}
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormField('category', value)}
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

            {/* Galeria de Mídia */}
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.media_gallery.map((media: any, index: number) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border">
                        <img 
                          src={media.url} 
                          alt={`Mídia ${index + 1}`}
                          className={`w-full h-24 sm:h-32 object-cover ${
                            index === formData.cover_image_index 
                              ? 'ring-2 ring-primary' 
                              : ''
                          }`}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetCoverImage(index)}
                          >
                            Capa
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveMedia(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {index === formData.cover_image_index && (
                          <Badge className="absolute top-1 left-1 bg-primary text-xs">
                            Capa
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Editor de Conteúdo */}
            <div>
              <Label htmlFor="content">Conteúdo *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => {
                  contentRef.current = content;
                  updateFormField('content', content);
                }}
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => updateFormField('slug', e.target.value)}
                placeholder="url-do-artigo"
              />
            </div>

            {/* Switches */}
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => updateFormField('published', checked)}
                />
                <Label htmlFor="published">Publicado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => updateFormField('featured', checked)}
                />
                <Label htmlFor="featured">Destaque</Label>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-2">
              <Button 
                type="submit" 
                disabled={submitting} 
                className="flex-1 sm:flex-none min-w-[140px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>{editingId ? 'Atualizar' : 'Publicar'} Artigo</>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPreview(true)} 
                className="flex-1 sm:flex-none"
              >
                Preview
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm} 
                  className="flex-1 sm:flex-none"
                >
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
          <CardTitle>Artigos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {article.category} • {article.published ? 'Publicado' : 'Rascunho'}
                  </p>
                </div>
                <div className="flex gap-2 ml-2">
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

      {/* Modal da Biblioteca de Mídia */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Biblioteca de Mídia</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2">
            <MediaLibrary onSelect={handleMediaSelect} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}
        >
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">Preview do Artigo</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPreview(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              <div className="mb-6">
                <Badge className="mb-4">{formData.category || 'Sem categoria'}</Badge>
                <h1 className="text-4xl font-bold mb-4 leading-tight">
                  {formData.title || 'Título do artigo'}
                </h1>
                {formData.subtitle && (
                  <p className="text-xl text-muted-foreground mb-6">
                    {formData.subtitle}
                  </p>
                )}
              </div>

              {formData.media_gallery.length > 0 && (
                <div className="mb-8">
                  {formData.media_gallery.length === 1 ? (
                    <img
                      src={formData.media_gallery[0].url}
                      alt={formData.title}
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.media_gallery.map((media: any, index: number) => (
                        <div key={index} className="relative">
                          {media.type === 'video' ? (
                            <video src={media.url} controls className="w-full h-auto rounded-lg" />
                          ) : (
                            <img src={media.url} alt={`Mídia ${index + 1}`} className="w-full h-auto rounded-lg" />
                          )}
                          {index === formData.cover_image_index && (
                            <Badge className="absolute top-2 left-2 bg-primary">Capa</Badge>
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

              {formData.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-sm font-semibold mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
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
