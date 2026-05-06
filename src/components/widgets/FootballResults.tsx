import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

const FootballResults = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`bg-card rounded-lg shadow-lg border border-border overflow-hidden transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="bg-primary p-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-primary-foreground" />
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-primary-foreground font-bold text-lg inline-block">
                ⚽ Futebol - Resultados dos times ⚽ Futebol - Resultados dos times ⚽
              </span>
            </div>
          </div>
        </div>
      </div>

      <iframe
        src="https://widget.api-futebol.com.br/render/widget_9d386b0eabad09a7"
        title="API Futebol — Widget"
        loading="lazy"
        referrerPolicy="unsafe-url"
        style={{ width: '100%', height: '520px', border: 0, background: 'transparent', borderRadius: '12px' }}
      />
    </div>
  );
};

export default FootballResults;
