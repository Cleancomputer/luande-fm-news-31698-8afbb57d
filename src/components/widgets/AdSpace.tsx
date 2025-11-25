import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import adBoaluz from "@/assets/ad-boaluz.jpg";
import adAnuncieAqui from "@/assets/ad-anuncie-aqui.png";

interface AdSpaceProps {
  position: "header" | "sidebar" | "content" | "footer";
  className?: string;
}

const AdSpace = ({ position, className = "" }: AdSpaceProps) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const ads = [
    { src: adBoaluz, alt: "Ótica & Joalheria Boa Luz" },
    { src: adAnuncieAqui, alt: "Anuncie sua marca aqui" }
  ];

  useEffect(() => {
    if (position === "header") {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 5000); // Alterna a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [position]);

  const dimensions = {
    header: "w-full h-24 md:h-28",
    sidebar: "w-full h-64",
    content: "w-full h-32",
    footer: "w-full h-24"
  };

  // Usar carrossel de anúncios para o espaço header
  if (position === "header") {
    return (
      <div className={`${dimensions[position]} ${className} overflow-hidden rounded-lg bg-muted/20 flex items-center justify-center relative`}>
        {ads.map((ad, index) => (
          <img 
            key={index}
            src={ad.src} 
            alt={ad.alt}
            className={`w-full h-full object-contain absolute transition-opacity duration-1000 ${
              index === currentAdIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className={`${dimensions[position]} ${className} flex items-center justify-center bg-muted/50 border-dashed`}>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Espaço Publicitário</p>
        <p className="text-xs text-muted-foreground">Anuncie aqui sua marca</p>
      </div>
    </Card>
  );
};

export default AdSpace;
