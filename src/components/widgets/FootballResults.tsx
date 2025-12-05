import { useState, useEffect } from 'react';
import { Trophy, Circle } from 'lucide-react';

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished' | 'scheduled';
  time?: string;
  league: string;
}

const mockMatches: Match[] = [
  { id: 1, homeTeam: 'Flamengo', awayTeam: 'Palmeiras', homeScore: 2, awayScore: 1, status: 'live', time: "67'", league: 'Brasileirão' },
  { id: 2, homeTeam: 'São Paulo', awayTeam: 'Corinthians', homeScore: 1, awayScore: 1, status: 'live', time: "45'", league: 'Brasileirão' },
  { id: 3, homeTeam: 'Grêmio', awayTeam: 'Internacional', homeScore: 3, awayScore: 2, status: 'finished', league: 'Brasileirão' },
  { id: 4, homeTeam: 'Santos', awayTeam: 'Botafogo', homeScore: 0, awayScore: 2, status: 'finished', league: 'Brasileirão' },
  { id: 5, homeTeam: 'Atlético-MG', awayTeam: 'Cruzeiro', homeScore: 0, awayScore: 0, status: 'scheduled', time: '21:00', league: 'Brasileirão' },
];

const FootballResults = () => {
  const [matches] = useState<Match[]>(mockMatches);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getStatusBadge = (match: Match) => {
    if (match.status === 'live') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-red-500 animate-pulse">
          <Circle className="w-2 h-2 fill-red-500" />
          AO VIVO {match.time}
        </span>
      );
    }
    if (match.status === 'finished') {
      return <span className="text-xs text-muted-foreground font-medium">Encerrado</span>;
    }
    return <span className="text-xs text-muted-foreground font-medium">{match.time}</span>;
  };

  return (
    <div className={`bg-card rounded-lg shadow-lg border border-border overflow-hidden transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header with animation */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-white" />
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-white font-bold text-lg inline-block">
                ⚽ Futebol - Resultados dos times ⚽ Futebol - Resultados dos times ⚽ Futebol - Resultados dos times ⚽
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Matches list */}
      <div className="divide-y divide-border">
        {matches.map((match, index) => (
          <div 
            key={match.id}
            className="p-3 hover:bg-muted/50 transition-colors"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: isVisible ? 'fade-in 0.3s ease-out forwards' : 'none'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{match.league}</span>
              {getStatusBadge(match)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${match.homeScore > match.awayScore ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                    {match.homeTeam}
                  </span>
                  <span className={`font-bold text-lg ${match.status === 'scheduled' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {match.status === 'scheduled' ? '-' : match.homeScore}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`font-medium text-sm ${match.awayScore > match.homeScore ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                    {match.awayTeam}
                  </span>
                  <span className={`font-bold text-lg ${match.status === 'scheduled' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {match.status === 'scheduled' ? '-' : match.awayScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-muted/30 p-2 text-center">
        <span className="text-xs text-muted-foreground">Dados de demonstração • Brasileirão Série A</span>
      </div>
    </div>
  );
};

export default FootballResults;
