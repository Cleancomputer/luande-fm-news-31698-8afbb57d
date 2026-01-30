import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import vivoEmpresas from "@/assets/ads/vivo-empresas.png";
import bradescoSeguros from "@/assets/ads/bradesco-seguros.png";
import bradesco from "@/assets/ads/bradesco.png";

interface Ad {
  src: string;
  alt: string;
  link: string;
}

// Anúncios com links clicáveis
const allAds: Ad[] = [
  { src: vivoEmpresas, alt: "Vivo Empresas", link: "https://vivo.com.br/para-empresas" },
  { src: bradescoSeguros, alt: "Bradesco Seguros", link: "https://www.bradescoseguros.com.br/clientes" },
  { src: bradesco, alt: "Banco Bradesco", link: "https://banco.bradesco/html/classic/index.shtm" },
];

interface SidebarAdsProps {
  side: "left" | "right";
}

const SidebarAds = ({ side }: SidebarAdsProps) => {
  const location = useLocation();
  const [currentIndices, setCurrentIndices] = useState([0, 1, 2]);
  
  // Não exibir no painel administrativo
  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname === "/login";
  
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

  // Ocultar no admin
  if (isAdminRoute) {
    return null;
  }

  return (
    <div
      className={`fixed ${side === "left" ? "left-2" : "right-2"} hidden 2xl:flex flex-col gap-3 z-20`}
      style={{
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      {currentIndices.map((adIndex, i) => (
        <a
          key={i}
          href={allAds[adIndex].link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-[130px] h-[160px] rounded-lg overflow-hidden bg-background/90 backdrop-blur-sm shadow-xl border border-border/50 transition-all duration-700 hover:scale-105 hover:shadow-2xl"
        >
          <img 
            src={allAds[adIndex].src} 
            alt={allAds[adIndex].alt}
            className="w-full h-full object-contain p-2"
          />
        </a>
      ))}
    </div>
  );
};

export default SidebarAds;
