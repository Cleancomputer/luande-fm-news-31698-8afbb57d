import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BarChart3, Vote } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Poll = () => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);
  const [polls, setPolls] = useState<any[]>([]);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolls();
    checkIfVoted();

    const pollsChannel = supabase
      .channel('polls-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls' }, () => { loadPolls(); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'poll_votes' }, () => { loadPolls(); })
      .subscribe();

    return () => { supabase.removeChannel(pollsChannel); };
  }, []);

  const loadPolls = async () => {
    try {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1);
      if (pollsError) throw pollsError;
      if (pollsData && pollsData.length > 0) {
        setActivePoll(pollsData[0]);
        setPolls(pollsData);
        const { data: votesData } = await supabase.from('poll_votes').select('*').eq('poll_id', pollsData[0].id);
        setVotes(votesData || []);
      }
    } catch (error) { console.error('Erro ao carregar enquetes:', error); }
    finally { setLoading(false); }
  };

  const checkIfVoted = () => {
    const votedPolls = localStorage.getItem('votedPolls');
    if (votedPolls) {
      const parsed = JSON.parse(votedPolls);
      if (activePoll && parsed.includes(activePoll.id)) setHasVoted(true);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !activePoll) return;
    try {
      const { error } = await supabase.from('poll_votes').insert([{ poll_id: activePoll.id, option_index: parseInt(selectedOption) }]);
      if (error) throw error;
      const votedPolls = localStorage.getItem('votedPolls');
      const parsed = votedPolls ? JSON.parse(votedPolls) : [];
      parsed.push(activePoll.id);
      localStorage.setItem('votedPolls', JSON.stringify(parsed));
      setHasVoted(true);
      toast.success('Voto registrado com sucesso!');
      loadPolls();
    } catch (error) { console.error('Erro ao votar:', error); toast.error('Erro ao registrar voto'); }
  };

  const getVoteCount = (optionIndex: number) => votes.filter(v => v.option_index === optionIndex).length;
  const totalVotes = votes.length;

  if (loading || !activePoll) {
    return (
      <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="bg-primary/10 pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            Enquete
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground text-center">
            {loading ? "Carregando..." : "Nenhuma enquete ativa no momento"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const options = activePoll.options || [];
  const maxVotes = Math.max(...options.map((_: any, i: number) => getVoteCount(i)), 1);

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary to-secondary pb-4">
        <CardTitle className="flex items-center gap-2 text-primary-foreground">
          <Vote className="h-5 w-5" />
          Enquete do Dia
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 pb-5">
        <h3 className="font-bold mb-4 text-base leading-snug">{activePoll.question}</h3>

        {!hasVoted ? (
          <div className="space-y-3">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 text-sm font-medium">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            <Button onClick={handleVote} disabled={!selectedOption} className="w-full mt-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Vote className="h-4 w-4 mr-2" />
              Votar
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option: string, index: number) => {
              const voteCount = getVoteCount(index);
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isWinning = voteCount === maxVotes && voteCount > 0;
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className={`font-medium ${isWinning ? 'text-primary' : ''}`}>{option}</span>
                    <span className={`font-bold ${isWinning ? 'text-primary' : ''}`}>{percentage}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full smooth-transition ${isWinning ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted-foreground/30'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground text-center mt-4 font-medium">
              ✅ Total de votos: {totalVotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Poll;
