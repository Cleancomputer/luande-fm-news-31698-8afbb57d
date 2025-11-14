import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RichTextEditor } from './RichTextEditor';
import { MediaLibrary } from './MediaLibrary';
import {
  Save,
  Eye,
  Calendar,
  Copy,
  History,
  Trash2,
  Plus,
  FileText,
  Image,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  category: string;
  image_url?: string;
  published: boolean;
  status: string;
  article_type: string;
  featured: boolean;
  featured_position?: string;
  tags: string[];
  scheduled_at?: string;
  created_at: string;
  slug: string;
  version?: number;
}

const CATEGORIES = ['Política', 'Policial', 'Esportes', 'Entretenimento', 'Música', 'Tecnologia', 'Cidades', 'Mundo', 'Sergipe', 'Educação', 'Acidente'];
const ARTICLE_TYPES = ['article', 'nota-rapida', 'coluna', 'blog', 'review'];
const FEATURED_POSITIONS = ['manchete', 'topo', 'destaque-lateral'];

const ContentManager = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category: 'Outros',
    image_url: '',
    published: false,
    status: 'draft',
    article_type: 'article',
    featured: false,
    featured_position: '',
    tags: [] as string[],
    scheduled_at: '',
    media_gallery: [] as { url: string; type: 'image' | 'video'; caption?: string }[],
  });
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadArticles();

    // Verificar se há um artigo para editar no localStorage
    const editingArticle = localStorage.getItem('editingArticle');
    if (editingArticle) {
      try {
        const article = JSON.parse(editingArticle);
        setFormData({
          title: article.title || '',
          subtitle: article.subtitle || '',
          content: article.content || '',
          category: article.category || 'Outros',
          image_url: article.image_url || '',
          published: article.published || false,
          status: article.status || 'draft',
          article_type: article.article_type || 'article',
          featured: article.featured || false,
          featured_position: article.featured_position || '',
          tags: article.tags || [],
          scheduled_at: article.scheduled_at || '',
          media_gallery: article.media_gallery || [],
        });
        setEditingId(article.id);
        
        // Limpar o localStorage
        localStorage.removeItem('editingArticle');
        
        toast.success('Artigo carregado para edição!');
      } catch (error) {
        console.error('Erro ao carregar artigo do localStorage:', error);
        localStorage.removeItem('editingArticle');
      }
    }
  }, []);

  useEffect(() => {
    if (editingId) {
      loadVersions(editingId);
    }
  }, [editingId]);

  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(article => article.category === categoryFilter));
    }
  }, [articles, categoryFilter]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (formData.title && formData.content) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [formData]);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
    }
  };

  const loadVersions = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('article_versions')
        .select('*')
        .eq('article_id', articleId)
        .order('version', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
    }
  };

  const handleAutoSave = async () => {
    if (!editingId || !user) return;

    try {
      await supabase
        .from('articles')
        .update({
          ...formData,
          status: 'draft',
        })
        .eq('id', editingId);

      console.log('Rascunho salvo automaticamente');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!formData.title || !formData.content) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    try {
      const articleData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        content: formData.content,
        category: formData.category,
        image_url: formData.image_url || null,
        published: true,
        status: 'published',
        article_type: formData.article_type,
        featured: formData.featured,
        featured_position: formData.featured_position || null,
        tags: formData.tags || [],
        scheduled_at: formData.scheduled_at || null,
        author_id: user.id,
        media_gallery: formData.media_gallery || [],
      };

      if (editingId) {
        // Atualizar artigo existente
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingId);

        if (error) {
          console.error('Erro ao atualizar:', error);
          throw error;
        }
        toast.success('Matéria atualizada e publicada!');
      } else {
        // Criar novo artigo
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);

        if (error) {
          console.error('Erro ao criar:', error);
          throw error;
        }
        toast.success('Matéria criada e publicada!');
      }

      resetForm();
      await loadArticles();
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast.error(`Erro ao salvar: ${error.message || 'Tente novamente'}`);
    }
  };

  const handleEdit = (article: Article) => {
    setFormData({
      title: article.title,
      subtitle: article.subtitle || '',
      content: article.content,
      category: article.category,
      image_url: article.image_url || '',
      published: article.published,
      status: article.status,
      article_type: article.article_type,
      featured: article.featured,
      featured_position: article.featured_position || '',
      tags: article.tags || [],
      scheduled_at: article.scheduled_at || '',
      media_gallery: (article as any).media_gallery || [],
    });
    setEditingId(article.id);
  };

  const handleDuplicate = async (article: Article) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('articles').insert({
        ...article,
        id: undefined,
        title: `${article.title} (cópia)`,
        published: false,
        status: 'draft',
        author_id: user.id,
        slug: null,
      });

      if (error) throw error;
      toast.success('Artigo duplicado com sucesso!');
      loadArticles();
    } catch (error) {
      console.error('Erro ao duplicar artigo:', error);
      toast.error('Erro ao duplicar artigo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);

      if (error) throw error;
      toast.success('Artigo excluído com sucesso!');
      loadArticles();
    } catch (error) {
      console.error('Erro ao excluir artigo:', error);
      toast.error('Erro ao excluir artigo');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      content: '',
      category: 'Outros',
      image_url: '',
      published: false,
      status: 'draft',
      article_type: 'article',
      featured: false,
      featured_position: '',
      tags: [],
      scheduled_at: '',
      media_gallery: [],
    });
    setEditingId(null);
    setVersions([]);
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const restoreVersion = async (version: any) => {
    if (!confirm('Restaurar esta versão?')) return;

    setFormData({
      ...formData,
      title: version.title,
      subtitle: version.subtitle || '',
      content: version.content,
      image_url: version.image_url || '',
      tags: version.tags || [],
    });
    toast.success('Versão restaurada! Clique em Salvar para aplicar.');
  };

  const handlePreview = () => {
    if (!formData.title || !formData.content) {
      toast.error('Preencha título e conteúdo para visualizar');
      return;
    }
    setShowPreview(true);
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    
    return articleDate.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Conteúdo</h2>
          <p className="text-muted-foreground">
            Crie, edite e publique notícias completas
          </p>
        </div>
        <Button onClick={resetForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Notícia
        </Button>
      </div>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">
            <FileText className="h-4 w-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="h-4 w-4 mr-2" />
            Biblioteca de Mídia
          </TabsTrigger>
          <TabsTrigger value="list">Lista de Artigos</TabsTrigger>
          {editingId && (
            <TabsTrigger value="versions">
              <History className="h-4 w-4 mr-2" />
              Versões
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? 'Editar Notícia' : 'Nova Notícia'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtítulo</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Tipo de Artigo</Label>
                    <Select
                      value={formData.article_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, article_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ARTICLE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="review">Em revisão</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo *</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) =>
                      setFormData({ ...formData, content })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-files">Galeria de Mídia (até 3 imagens + 1 vídeo)</Label>
                  <Input
                    id="media-files"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!user) return;

                      const images = files.filter(f => f.type.startsWith('image/'));
                      const videos = files.filter(f => f.type.startsWith('video/'));

                      if (images.length > 3) {
                        toast.error('Máximo de 3 imagens permitidas');
                        return;
                      }
                      if (videos.length > 1) {
                        toast.error('Máximo de 1 vídeo permitido');
                        return;
                      }

                      try {
                        const uploadedMedia: { url: string; type: 'image' | 'video' }[] = [];

                        for (const file of files) {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${Math.random()}.${fileExt}`;
                          const filePath = `${user.id}/${fileName}`;

                          const { error: uploadError } = await supabase.storage
                            .from('media')
                            .upload(filePath, file);

                          if (uploadError) throw uploadError;

                          const { data: { publicUrl } } = supabase.storage
                            .from('media')
                            .getPublicUrl(filePath);

                          await supabase
                            .from('media_library')
                            .insert({
                              file_name: file.name,
                              file_path: publicUrl,
                              file_type: file.type,
                              file_size: file.size,
                              mime_type: file.type,
                              uploaded_by: user.id,
                            });

                          uploadedMedia.push({
                            url: publicUrl,
                            type: file.type.startsWith('image/') ? 'image' : 'video',
                          });
                        }

                        setFormData({ 
                          ...formData, 
                          media_gallery: [...formData.media_gallery, ...uploadedMedia],
                          image_url: uploadedMedia[0]?.url || formData.image_url
                        });
                        toast.success('Mídias carregadas com sucesso!');
                      } catch (error) {
                        console.error('Erro ao fazer upload:', error);
                        toast.error('Erro ao enviar mídias');
                      }
                    }}
                  />
                  {formData.media_gallery.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {formData.media_gallery.map((media, idx) => (
                        <div key={idx} className="relative">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={`Mídia ${idx + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="w-full h-32 object-cover rounded"
                              controls
                            />
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1"
                            onClick={() => {
                              const newGallery = formData.media_gallery.filter((_, i) => i !== idx);
                              setFormData({ ...formData, media_gallery: newGallery });
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Digite uma tag e pressione Enter"
                    />
                    <Button type="button" onClick={addTag}>
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, featured: checked })
                      }
                    />
                    <Label htmlFor="featured">Destacar na Capa</Label>
                  </div>

                  {formData.featured && (
                    <div className="space-y-2">
                      <Label>Posição do Destaque</Label>
                      <Select
                        value={formData.featured_position}
                        onValueChange={(value) =>
                          setFormData({ ...formData, featured_position: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {FEATURED_POSITIONS.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled">Agendar Publicação (Opcional)</Label>
                    <Input
                      id="scheduled"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduled_at: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para publicar imediatamente
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar e Publicar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handlePreview}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Pré-visualizar
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <MediaLibrary
            onSelect={(url) => {
              setFormData({ ...formData, image_url: url });
              toast.success('Imagem selecionada!');
            }}
          />
        </TabsContent>

        <TabsContent value="list">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="category-filter">Filtrar por Categoria:</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'matéria' : 'matérias'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4">
            {filteredArticles.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {article.subtitle}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{article.category}</Badge>
                        <Badge variant="outline">{article.status}</Badge>
                        {article.featured && (
                          <Badge>Destaque</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(article)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDuplicate(article)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {editingId && (
          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Versões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="border rounded p-4 flex justify-between items-start"
                    >
                      <div>
                        <p className="font-semibold">
                          Versão {version.version}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(version.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm mt-2">{version.title}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreVersion(version)}
                      >
                        <History className="h-4 w-4 mr-2" />
                        Restaurar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização da Notícia</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt={formData.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>{formData.category}</Badge>
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-4xl font-bold">{formData.title}</h1>
              {formData.subtitle && (
                <p className="text-xl text-muted-foreground">{formData.subtitle}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Por: Redação LuandêFM</span>
                <span>•</span>
                <span>{formatDate(new Date().toISOString())}</span>
              </div>
            </div>
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManager;
