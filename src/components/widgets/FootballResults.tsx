import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

const FootballResults = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

      {/* Widget iframe */}
      <iframe 
        src="https://widget.api-futebol.com.br/render/widget_9d386b0eabad09a7" 
        title="API Futebol - Widget" 
        className="w-full border-0"
        style={{ height: '520px', background: 'transparent' }}
        loading="lazy" 
        referrerPolicy="unsafe-url" 
        sandbox="allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

export default FootballResults;
