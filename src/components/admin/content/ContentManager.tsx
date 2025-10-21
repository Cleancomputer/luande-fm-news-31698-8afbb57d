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

const CATEGORIES = ['Esportes', 'Política', 'Tecnologia', 'Mundo', 'Música', 'Outros'];
const ARTICLE_TYPES = ['article', 'nota-rapida', 'coluna', 'blog', 'review'];
const FEATURED_POSITIONS = ['manchete', 'topo', 'destaque-lateral'];

const ContentManager = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
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
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    if (editingId) {
      loadVersions(editingId);
    }
  }, [editingId]);

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
    if (!user) return;

    try {
      const articleData = {
        ...formData,
        author_id: user.id,
      };

      if (editingId) {
        // Salvar versão anterior
        const currentArticle = articles.find((a) => a.id === editingId);
        if (currentArticle) {
          await supabase.from('article_versions').insert({
            article_id: editingId,
            version: currentArticle.version || 1,
            title: currentArticle.title,
            subtitle: currentArticle.subtitle,
            content: currentArticle.content,
            image_url: currentArticle.image_url,
            category: currentArticle.category,
            tags: currentArticle.tags,
            created_by: user.id,
          });
        }

        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Artigo atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('articles').insert(articleData);

        if (error) throw error;
        toast.success('Artigo criado com sucesso!');
      }

      resetForm();
      loadArticles();
    } catch (error) {
      console.error('Erro ao salvar artigo:', error);
      toast.error('Erro ao salvar artigo');
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
                  <Label htmlFor="image-url">Imagem de Capa</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image-url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      placeholder="URL da imagem"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded mt-2"
                    />
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, published: checked })
                      }
                    />
                    <Label htmlFor="published">Publicar Imediatamente</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduled">Agendar Publicação</Label>
                    <Input
                      id="scheduled"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduled_at: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button type="button" variant="outline">
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
          <div className="grid gap-4">
            {articles.map((article) => (
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
    </div>
  );
};

export default ContentManager;
