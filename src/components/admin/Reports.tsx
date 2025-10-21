import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArticleStats {
  category: string;
  count: number;
}

interface PollStats {
  id: string;
  question: string;
  totalVotes: number;
}

const Reports = () => {
  const [articlesByCategory, setArticlesByCategory] = useState<ArticleStats[]>([]);
  const [pollsVotes, setPollsVotes] = useState<PollStats[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Matérias por categoria
      const { data: articles } = await supabase
        .from('articles')
        .select('category');

      if (articles) {
        const categoryCount = articles.reduce((acc: { [key: string]: number }, article) => {
          acc[article.category] = (acc[article.category] || 0) + 1;
          return acc;
        }, {});

        const stats = Object.entries(categoryCount).map(([category, count]) => ({
          category,
          count: count as number,
        }));

        setArticlesByCategory(stats);
      }

      // Votos por enquete
      const { data: polls } = await supabase
        .from('polls')
        .select('id, question');

      if (polls) {
        const pollsWithVotes = await Promise.all(
          polls.map(async (poll) => {
            const { count } = await supabase
              .from('poll_votes')
              .select('*', { count: 'exact', head: true })
              .eq('poll_id', poll.id);

            return {
              id: poll.id,
              question: poll.question,
              totalVotes: count || 0,
            };
          })
        );

        setPollsVotes(pollsWithVotes);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Análise de dados e estatísticas</p>
      </div>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">Matérias</TabsTrigger>
          <TabsTrigger value="polls">Enquetes</TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <CardTitle>Matérias por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articlesByCategory.map((stat) => (
                    <TableRow key={stat.category}>
                      <TableCell className="font-medium">{stat.category}</TableCell>
                      <TableCell className="text-right">{stat.count}</TableCell>
                    </TableRow>
                  ))}
                  {articlesByCategory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhum dado disponível
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="polls">
          <Card>
            <CardHeader>
              <CardTitle>Votos por Enquete</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pergunta</TableHead>
                    <TableHead className="text-right">Total de Votos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pollsVotes.map((poll) => (
                    <TableRow key={poll.id}>
                      <TableCell className="font-medium">{poll.question}</TableCell>
                      <TableCell className="text-right">{poll.totalVotes}</TableCell>
                    </TableRow>
                  ))}
                  {pollsVotes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhum dado disponível
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

export default Reports;
