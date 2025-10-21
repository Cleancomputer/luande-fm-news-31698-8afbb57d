import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bell,
  Send,
  Clock,
  Zap,
  Users,
  Filter,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: string;
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  category: string;
  sent_at: string;
  total_sent: number;
  total_clicked: number;
}

const CATEGORIES = ['Esportes', 'Política', 'Tecnologia', 'Mundo', 'Música', 'Outros'];

const Notifications = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [subscriptions, setSubscriptions] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    article_id: '',
    category: '',
    auto_send: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar artigos publicados
      const { data: articlesData } = await supabase
        .from('articles')
        .select('id, title, category')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (articlesData) setArticles(articlesData);

      // Carregar histórico
      const { data: historyData } = await supabase
        .from('notification_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (historyData) setHistory(historyData);

      // Contar subscriptions
      const { count } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true });

      setSubscriptions(count || 0);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.body) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Salvar no histórico
      const { error } = await supabase
        .from('notification_history')
        .insert({
          title: formData.title,
          body: formData.body,
          article_id: formData.article_id || null,
          category: formData.category || null,
          total_sent: subscriptions,
        });

      if (error) throw error;

      toast.success('Notificação enviada com sucesso!');
      setFormData({
        title: '',
        body: '',
        article_id: '',
        category: '',
        auto_send: false,
      });
      loadData();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    }
  };

  const sendBreakingNews = async (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    try {
      await supabase
        .from('notification_history')
        .insert({
          title: '🚨 ÚLTIMA HORA',
          body: article.title,
          article_id: articleId,
          category: article.category,
          total_sent: subscriptions,
        });

      toast.success('Breaking News enviada!');
      loadData();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar breaking news');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
            Notificações e Engajamento
          </h2>
          <p className="text-muted-foreground">
            Mantenha seu público engajado e informado
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 hover-scale transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscritos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {subscriptions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              usuários recebendo notificações
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover-scale transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas Hoje</CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {history.filter(h => 
                new Date(h.sent_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">notificações</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover-scale transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cliques</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {history.length > 0
                ? ((history.reduce((sum, h) => sum + h.total_clicked, 0) /
                    history.reduce((sum, h) => sum + h.total_sent, 0)) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">média de engajamento</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="send" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-pink-600">
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </TabsTrigger>
          <TabsTrigger value="breaking" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-pink-600">
            <Zap className="h-4 w-4 mr-2" />
            Breaking News
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-pink-600">
            <Clock className="h-4 w-4 mr-2" />
            Automação
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-pink-600">
            <Bell className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Enviar Notificação Push
              </CardTitle>
              <CardDescription>
                Envie notificações personalizadas para seus leitores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Notificação *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Nova matéria publicada!"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Mensagem *</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Escreva a mensagem da notificação..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Artigo Relacionado (Opcional)</Label>
                    <Select
                      value={formData.article_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, article_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um artigo" />
                      </SelectTrigger>
                      <SelectContent>
                        {articles.map((article) => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Filtrar por Categoria</Label>
                    <Select
                      value={formData.category || "all"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value === "all" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Será enviada para {subscriptions.toLocaleString()} inscritos
                    </p>
                    {formData.category && (
                      <p className="text-xs text-muted-foreground">
                        Filtrado por categoria: {formData.category}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificação
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaking" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Breaking News - Últimas Notícias
              </CardTitle>
              <CardDescription>
                Envie alertas urgentes sobre matérias importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {articles.slice(0, 10).map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:border-orange-500 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground">{article.category}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendBreakingNews(article.id)}
                      className="ml-4"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Automação de Notificações
              </CardTitle>
              <CardDescription>
                Configure envios automáticos baseados em eventos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ao publicar nova matéria</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificação automaticamente
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Digest diário</p>
                    <p className="text-sm text-muted-foreground">
                      Resumo das principais notícias às 18h
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificação por categoria</p>
                    <p className="text-sm text-muted-foreground">
                      Usuários recebem apenas das categorias escolhidas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Histórico de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Enviadas</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                    <TableHead className="text-right">Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((notif) => {
                    const clickRate = notif.total_sent > 0
                      ? ((notif.total_clicked / notif.total_sent) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <TableRow key={notif.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-sm">
                          {new Date(notif.sent_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {notif.title}
                        </TableCell>
                        <TableCell>
                          {notif.category && (
                            <Badge variant="outline">{notif.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {notif.total_sent.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {notif.total_clicked.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {clickRate}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhuma notificação enviada ainda
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
