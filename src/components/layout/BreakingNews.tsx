import { Radio } from "lucide-react";

const breakingNews = [
  "🔴 AO VIVO: Cobertura especial sobre grandes transformações na capital",
  "⚽ ESPORTES: Time local conquista vitória histórica",
  "💡 TECNOLOGIA: Inovação promete revolucionar setor de energia",
  "🎵 MÚSICA: Festival reúne milhares em evento memorável",
  "🌍 MUNDO: Conferência internacional debate desafios globais"
];

const BreakingNews = () => {
  return (
    <div className="gradient-yellow-glow overflow-hidden shadow-glow">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-accent-foreground font-bold text-sm whitespace-nowrap">
            <Radio className="h-4 w-4 animate-pulse" />
            <span className="hidden sm:inline">ÚLTIMAS NOTÍCIAS</span>
            <span className="sm:hidden">NEWS</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-8 animate-slide-left">
              {[...breakingNews, ...breakingNews].map((news, index) => (
                <span
                  key={index}
                  className="text-sm font-medium text-accent-foreground whitespace-nowrap"
                >
                  {news}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;
