import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  ExternalLink
} from "lucide-react";

interface ArticleStats {
  id: string;
  title: string;
  views: number;
  avg_read_time: number;
  category: string;
}

interface TrafficSource {
  source: string;
  count: number;
}

interface CategoryStats {
  category: string;
  total_views: number;
  articles_count: number;
}

const Analytics = () => {
  const [topArticles, setTopArticles] = useState<ArticleStats[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalViews: 0,
    avgReadTime: 0,
    totalArticles: 0,
    publishedArticles: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Artigos mais lidos
      const { data: articlesData } = await supabase
        .from('article_analytics')
        .select(`
          article_id,
          views,
          avg_read_time,
          articles!inner(title, category)
        `)
        .order('views', { ascending: false })
        .limit(10);

      if (articlesData) {
        const formatted = articlesData.map(item => ({
          id: item.article_id,
          title: (item as any).articles.title,
          category: (item as any).articles.category,
          views: item.views,
          avg_read_time: item.avg_read_time || 0,
        }));
        setTopArticles(formatted);
      }

      // Origem do tráfego
      const { data: trafficData } = await supabase
        .from('article_analytics')
        .select('traffic_source, views');

      if (trafficData) {
        const sources = trafficData.reduce((acc: any, item) => {
          const source = item.traffic_source || 'Direto';
          acc[source] = (acc[source] || 0) + (item.views || 0);
          return acc;
        }, {});

        const formatted = Object.entries(sources).map(([source, count]) => ({
          source,
          count: count as number,
        }));
        setTrafficSources(formatted);
      }

      // Estatísticas por categoria
      const { data: articlesAll } = await supabase
        .from('articles')
        .select('category');

      const { data: analyticsAll } = await supabase
        .from('article_analytics')
        .select('article_id, views');

      if (articlesAll && analyticsAll) {
        const categoryMap = new Map();
        articlesAll.forEach(article => {
          if (!categoryMap.has(article.category)) {
            categoryMap.set(article.category, { count: 0, views: 0 });
          }
          const stats = categoryMap.get(article.category);
          stats.count++;
        });

        setCategoryStats(
          Array.from(categoryMap.entries()).map(([category, stats]: any) => ({
            category,
            articles_count: stats.count,
            total_views: stats.views,
          }))
        );
      }

      // Estatísticas totais
      const { count: totalArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      const { count: publishedArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      const { data: viewsData } = await supabase
        .from('article_analytics')
        .select('views, avg_read_time');

      let totalViews = 0;
      let totalReadTime = 0;
      let readTimeCount = 0;

      if (viewsData) {
        viewsData.forEach(item => {
          totalViews += item.views || 0;
          if (item.avg_read_time) {
            totalReadTime += item.avg_read_time;
            readTimeCount++;
          }
        });
      }

      setTotalStats({
        totalViews,
        avgReadTime: readTimeCount > 0 ? Math.round(totalReadTime / readTimeCount) : 0,
        totalArticles: totalArticles || 0,
        publishedArticles: publishedArticles || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Analytics e Relatórios
          </h2>
          <p className="text-muted-foreground">
            Entenda sua audiência e planeje seu conteúdo
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas Totais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover-scale transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalStats.publishedArticles} artigos publicados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover-scale transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Leitura</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.floor(totalStats.avgReadTime / 60)}:{String(totalStats.avgReadTime % 60).padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">minutos por artigo</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover-scale transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Artigos</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalStats.totalArticles}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalStats.publishedArticles} publicados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover-scale transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalStats.totalArticles > 0
                ? Math.round(totalStats.totalViews / totalStats.totalArticles)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">visualizações/artigo</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="top-articles" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="top-articles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Mais Lidas
          </TabsTrigger>
          <TabsTrigger value="traffic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600">
            <Users className="h-4 w-4 mr-2" />
            Tráfego
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600">
            <PieChart className="h-4 w-4 mr-2" />
            Por Categoria
          </TabsTrigger>
          <TabsTrigger value="integration" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600">
            <ExternalLink className="h-4 w-4 mr-2" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top-articles" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Ranking das Notícias Mais Lidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Visualizações</TableHead>
                    <TableHead className="text-right">Tempo Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topArticles.map((article, index) => (
                    <TableRow key={article.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-muted'
                        }`}>
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium max-w-md truncate">
                        {article.title}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {article.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {article.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {Math.floor(article.avg_read_time / 60)}:{String(article.avg_read_time % 60).padStart(2, '0')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {topArticles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum dado disponível
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Origem do Tráfego
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source, index) => {
                  const total = trafficSources.reduce((sum, s) => sum + s.count, 0);
                  const percentage = total > 0 ? (source.count / total) * 100 : 0;
                  
                  return (
                    <div key={source.source} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{source.source}</span>
                        <span className="text-sm text-muted-foreground">
                          {source.count.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {trafficSources.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum dado de tráfego disponível
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Relatório por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Artigos</TableHead>
                    <TableHead className="text-right">Visualizações</TableHead>
                    <TableHead className="text-right">Média</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryStats.map((stat) => (
                    <TableRow key={stat.category} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{stat.category}</TableCell>
                      <TableCell className="text-right">{stat.articles_count}</TableCell>
                      <TableCell className="text-right">{stat.total_views.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {stat.articles_count > 0
                          ? Math.round(stat.total_views / stat.articles_count)
                          : 0}
                      </TableCell>
                    </TableRow>
                  ))}
                  {categoryStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum dado disponível
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Integrações Externas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Google Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Análise detalhada de comportamento do usuário
                    </p>
                  </div>
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    Acessar <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Google Search Console</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitoramento de SEO e desempenho em buscas
                    </p>
                  </div>
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    Acessar <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Para integrar essas ferramentas, adicione os códigos de rastreamento nas configurações do site.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
