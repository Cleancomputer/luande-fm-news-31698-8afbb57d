import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";

const Poll = () => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);

  const options = [
    { id: "politica", label: "Política", votes: 35 },
    { id: "esportes", label: "Esportes", votes: 28 },
    { id: "tecnologia", label: "Tecnologia", votes: 22 },
    { id: "entretenimento", label: "Entretenimento", votes: 15 }
  ];

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = () => {
    if (selectedOption) {
      setHasVoted(true);
    }
  };

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
          Qual assunto mais te interessa?
        </h3>

        {!hasVoted ? (
          <div className="space-y-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.label}
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
            {options.map((option) => {
              const percentage = Math.round((option.votes / totalVotes) * 100);
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option.label}</span>
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
