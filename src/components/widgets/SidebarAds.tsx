import { useState, useEffect } from "react";
import vivoEmpresas from "@/assets/ads/vivo-empresas.png";
import bradescoSeguros from "@/assets/ads/bradesco-seguros.png";
import bradesco from "@/assets/ads/bradesco.png";
import adBoaluz from "@/assets/ad-boaluz.jpg";
import adAnuncieAqui from "@/assets/ad-anuncie-aqui.png";

interface Ad {
  src: string;
  alt: string;
}

const allAds: Ad[] = [
  { src: vivoEmpresas, alt: "Vivo Empresas" },
  { src: bradescoSeguros, alt: "Bradesco Seguros" },
  { src: bradesco, alt: "Banco Bradesco" },
  { src: adBoaluz, alt: "Ótica & Joalheria Boa Luz" },
  { src: adAnuncieAqui, alt: "Anuncie sua marca aqui" },
];

interface SidebarAdsProps {
  side: "left" | "right";
}

const SidebarAds = ({ side }: SidebarAdsProps) => {
  const [currentIndices, setCurrentIndices] = useState([0, 1, 2]);
  
  useEffect(() => {
    // Randomize starting indices based on side
    const offset = side === "left" ? 0 : 2;
    setCurrentIndices([
      (offset) % allAds.length,
      (offset + 1) % allAds.length,
      (offset + 2) % allAds.length,
    ]);
  }, [side]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => prev.map((i) => (i + 1) % allAds.length));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 ${side === "left" ? "left-2" : "right-2"} hidden 2xl:flex flex-col gap-3 z-40`}
      style={{ maxWidth: "140px" }}
    >
      {currentIndices.map((adIndex, i) => (
        <div 
          key={i}
          className="w-[130px] h-[160px] rounded-lg overflow-hidden bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 flex items-center justify-center transition-all duration-700 hover:scale-105"
        >
          <img 
            src={allAds[adIndex].src} 
            alt={allAds[adIndex].alt}
            className="w-full h-full object-contain p-2"
          />
        </div>
      ))}
    </div>
  );
};

export default SidebarAds;
