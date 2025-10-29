import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";
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
  }, []);

  const loadPolls = async () => {
    try {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (pollsError) throw pollsError;

      if (pollsData && pollsData.length > 0) {
        setActivePoll(pollsData[0]);
        setPolls(pollsData);
        
        // Carregar votos
        const { data: votesData, error: votesError } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('poll_id', pollsData[0].id);

        if (votesError) throw votesError;
        setVotes(votesData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar enquetes:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfVoted = () => {
    const votedPolls = localStorage.getItem('votedPolls');
    if (votedPolls) {
      const parsed = JSON.parse(votedPolls);
      if (activePoll && parsed.includes(activePoll.id)) {
        setHasVoted(true);
      }
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !activePoll) return;

    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: activePoll.id,
          option_index: parseInt(selectedOption)
        }]);

      if (error) throw error;

      // Marcar como votado no localStorage
      const votedPolls = localStorage.getItem('votedPolls');
      const parsed = votedPolls ? JSON.parse(votedPolls) : [];
      parsed.push(activePoll.id);
      localStorage.setItem('votedPolls', JSON.stringify(parsed));

      setHasVoted(true);
      toast.success('Voto registrado com sucesso!');
      loadPolls();
    } catch (error) {
      console.error('Erro ao votar:', error);
      toast.error('Erro ao registrar voto');
    }
  };

  const getVoteCount = (optionIndex: number) => {
    return votes.filter(v => v.option_index === optionIndex).length;
  };

  const totalVotes = votes.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activePoll) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            Enquete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma enquete ativa no momento
          </p>
        </CardContent>
      </Card>
    );
  }

  const options = activePoll.options || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          Enquete
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-4 text-sm">
          {activePoll.question}
        </h3>

        {!hasVoted ? (
          <div className="space-y-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption}
              className="w-full"
            >
              Votar
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option: string, index: number) => {
              const voteCount = getVoteCount(index);
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option}</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary smooth-transition"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Total de votos: {totalVotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Poll;
