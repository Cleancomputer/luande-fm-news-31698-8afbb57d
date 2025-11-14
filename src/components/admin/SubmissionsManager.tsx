import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Award, Eye } from "lucide-react";

const SubmissionsManager = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error("Erro ao carregar submissões");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('user_submissions')
        .update({ status, admin_notes: adminNotes })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Submissão ${status === 'approved' ? 'aprovada' : status === 'rejected' ? 'rejeitada' : 'premiada'}`);
      fetchSubmissions();
      setSelectedSubmission(null);
      setAdminNotes("");
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error("Erro ao atualizar submissão");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      rewarded: "default"
    };
    
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status === 'pending' ? 'Pendente' : 
         status === 'approved' ? 'Aprovado' : 
         status === 'rejected' ? 'Rejeitado' : 'Premiado'}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submissões de Conteúdo</CardTitle>
          <CardDescription>Gerencie as notícias enviadas pelos leitores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-semibold">{submission.name}</div>
                      <div className="text-sm text-muted-foreground">{submission.contact}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(submission.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>

                  <p className="text-sm">{submission.description}</p>

                  {submission.media_urls && submission.media_urls.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {submission.media_urls.map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Mídia {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {selectedSubmission?.id === submission.id && (
                    <div className="space-y-3 pt-3 border-t">
                      <Textarea
                        placeholder="Observações do administrador..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatus(submission.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(submission.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateStatus(submission.id, 'rewarded')}
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Premiar
                        </Button>
                      </div>
                    </div>
                  )}

                  {submission.status === 'pending' && selectedSubmission?.id !== submission.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setAdminNotes(submission.admin_notes || "");
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Avaliar
                    </Button>
                  )}

                  {submission.admin_notes && (
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <div className="font-medium mb-1">Observações:</div>
                      {submission.admin_notes}
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {submissions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma submissão encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionsManager;
