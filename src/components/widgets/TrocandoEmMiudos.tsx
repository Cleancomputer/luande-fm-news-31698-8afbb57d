import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { MessageCircle, Send, ThumbsUp, Clock, User, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_name: string;
  comment: string;
  emoji: string | null;
  likes_count: number;
  created_at: string;
}

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  image_url: string | null;
  slug: string;
  created_at: string;
}

const EMOJIS = ["👍", "❤️", "😮", "😢", "😡", "🎉"];

const TrocandoEmMiudos = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLatestArticles();
  }, []);

  useEffect(() => {
    if (selectedArticle) {
      loadComments(selectedArticle.id);

      // Realtime subscription for comments
      const channel = supabase
        .channel('discussions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'article_discussions',
            filter: `article_id=eq.${selectedArticle.id}`
          },
          () => {
            loadComments(selectedArticle.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedArticle]);

  const loadLatestArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, subtitle, category, image_url, slug, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setArticles(data || []);
      if (data && data.length > 0) {
        setSelectedArticle(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('article_discussions')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast.error("Digite seu nome para comentar");
      return;
    }
    
    if (!newComment.trim()) {
      toast.error("Digite um comentário");
      return;
    }

    if (!selectedArticle) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('article_discussions')
        .insert({
          article_id: selectedArticle.id,
          user_name: userName.trim(),
          comment: newComment.trim(),
          emoji: selectedEmoji
        });

      if (error) throw error;
      
      setNewComment("");
      setSelectedEmoji(null);
      toast.success("Comentário enviado!");
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast.error("Erro ao enviar comentário");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    return commentDate.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="my-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-orange-600"></span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Trocando em Miúdos
        </h2>
        <Sparkles className="h-6 w-6 text-amber-500" />
      </div>
      
      <p className="text-muted-foreground mb-6 pl-4 border-l-2 border-amber-300">
        Debata as notícias mais recentes com outros leitores. Deixe sua opinião, reaja e participe!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article Selection */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-amber-600" />
                Notícias para Debate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    selectedArticle?.id === article.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-white/5 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
                  }`}
                >
                  <Badge 
                    variant="outline" 
                    className={`mb-1 text-xs ${
                      selectedArticle?.id === article.id 
                        ? 'border-white/50 text-white' 
                        : 'border-amber-300 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {article.category}
                  </Badge>
                  <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Discussion Area */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-white to-amber-50/30 dark:from-background dark:to-amber-950/10 border-amber-200/50 dark:border-amber-800/50">
            {selectedArticle && (
              <>
                <CardHeader className="border-b border-amber-100 dark:border-amber-900/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Badge className="bg-amber-500 hover:bg-amber-600 mb-2">
                        {selectedArticle.category}
                      </Badge>
                      <CardTitle 
                        className="text-xl cursor-pointer hover:text-amber-600 transition-colors"
                        onClick={() => navigate(`/artigo/${selectedArticle.slug}`)}
                      >
                        {selectedArticle.title}
                      </CardTitle>
                      {selectedArticle.subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedArticle.subtitle}
                        </p>
                      )}
                    </div>
                    {selectedArticle.image_url && (
                      <img 
                        src={selectedArticle.image_url} 
                        alt={selectedArticle.title}
                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {/* Comment Form */}
                  <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg">
                    <div className="flex gap-3 mb-3">
                      <Input
                        placeholder="Seu nome"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="max-w-[200px] bg-white dark:bg-background"
                      />
                      <div className="flex gap-1">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                            className={`text-xl p-1 rounded transition-all ${
                              selectedEmoji === emoji 
                                ? 'bg-amber-200 dark:bg-amber-800 scale-110' 
                                : 'hover:bg-amber-100 dark:hover:bg-amber-900'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Deixe seu comentário sobre esta notícia..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] bg-white dark:bg-background resize-none"
                      />
                      <Button 
                        type="submit" 
                        disabled={submitting}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Seja o primeiro a comentar!</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div 
                          key={comment.id} 
                          className="p-4 bg-white dark:bg-white/5 rounded-lg shadow-sm border border-amber-100 dark:border-amber-900/30"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                {comment.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium text-sm">{comment.user_name}</span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(comment.created_at)}
                                </div>
                              </div>
                            </div>
                            {comment.emoji && (
                              <span className="text-xl">{comment.emoji}</span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/90 pl-10">{comment.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TrocandoEmMiudos;
