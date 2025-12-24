import { useState, useEffect } from "react";
import vivoEmpresas from "@/assets/ads/vivo-empresas.png";
import bradescoSeguros from "@/assets/ads/bradesco-seguros.png";
import bradesco from "@/assets/ads/bradesco.png";

interface Ad {
  src: string;
  alt: string;
}

// Apenas os anúncios que o usuário fez upload
const allAds: Ad[] = [
  { src: vivoEmpresas, alt: "Vivo Empresas" },
  { src: bradescoSeguros, alt: "Bradesco Seguros" },
  { src: bradesco, alt: "Banco Bradesco" },
];

interface SidebarAdsProps {
  side: "left" | "right";
}

const SidebarAds = ({ side }: SidebarAdsProps) => {
  const [currentIndices, setCurrentIndices] = useState([0, 1, 2]);
  
  useEffect(() => {
    // Randomize starting indices based on side
    const offset = side === "left" ? 0 : 1;
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
      className={`fixed ${side === "left" ? "left-4" : "right-4"} hidden 2xl:flex flex-col gap-4 z-20`}
      style={{
        top: "calc((100vh - var(--portal-header-h, 0px) - var(--portal-footer-h, 0px)) / 2 + var(--portal-header-h, 0px))",
        transform: "translateY(-50%)",
      }}
    >
      {currentIndices.map((adIndex, i) => (
        <div 
          key={i}
          className="w-[140px] h-[170px] rounded-lg overflow-hidden bg-background/90 backdrop-blur-sm shadow-xl border border-border/50 flex items-center justify-center transition-all duration-700 hover:scale-105"
        >
          <img 
            src={allAds[adIndex].src} 
            alt={allAds[adIndex].alt}
            className="w-full h-full object-contain p-3"
          />
        </div>
      ))}
    </div>
  );
};

export default SidebarAds;
