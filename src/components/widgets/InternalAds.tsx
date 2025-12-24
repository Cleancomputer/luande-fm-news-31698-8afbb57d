import { useState, useEffect } from "react";
import vivoEmpresas from "@/assets/ads/vivo-empresas.png";
import bradescoSeguros from "@/assets/ads/bradesco-seguros.png";
import bradesco from "@/assets/ads/bradesco.png";
import adBoaluz from "@/assets/ad-boaluz.jpg";
import adAnuncieAqui from "@/assets/ad-anuncie-aqui.png";
// Mobile horizontal ads
import mobileVivoEmpresas from "@/assets/ads/mobile-vivo-empresas.png";
import mobileBradescoSeguros from "@/assets/ads/mobile-bradesco-seguros.png";
import mobileBradesco from "@/assets/ads/mobile-bradesco.png";

interface Ad {
  src: string;
  mobileSrc?: string;
  alt: string;
  link?: string;
}

const allAds: Ad[] = [
  { src: vivoEmpresas, mobileSrc: mobileVivoEmpresas, alt: "Vivo Empresas" },
  { src: bradescoSeguros, mobileSrc: mobileBradescoSeguros, alt: "Bradesco Seguros" },
  { src: bradesco, mobileSrc: mobileBradesco, alt: "Banco Bradesco" },
  { src: adBoaluz, alt: "Ótica & Joalheria Boa Luz" },
  { src: adAnuncieAqui, alt: "Anuncie sua marca aqui" },
];

const uploadedAds: Ad[] = [
  { src: vivoEmpresas, mobileSrc: mobileVivoEmpresas, alt: "Vivo Empresas" },
  { src: bradescoSeguros, mobileSrc: mobileBradescoSeguros, alt: "Bradesco Seguros" },
  { src: bradesco, mobileSrc: mobileBradesco, alt: "Banco Bradesco" },
];

interface InternalAdsProps {
  position: "sidebar" | "inline" | "banner" | "article";
  source?: "all" | "uploaded";
  mobileFormat?: "default" | "horizontal";
  className?: string;
}

const InternalAds = ({ position, source = "all", mobileFormat = "default", className = "" }: InternalAdsProps) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const ads = source === "uploaded" ? uploadedAds : allAds;
  
  // Randomize starting index
  useEffect(() => {
    setCurrentAdIndex(Math.floor(Math.random() * ads.length));
  }, [ads.length]);

  // Rotate ads every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  const getStyles = () => {
    switch (position) {
      case "sidebar":
        return "w-full max-w-[160px] min-h-[600px] flex flex-col gap-4";
      case "inline":
        return mobileFormat === "horizontal"
          ? "w-full max-w-full aspect-[4/1] md:aspect-auto md:h-28"
          : "w-full max-w-full h-24 md:h-28";
      case "banner":
        return "w-full h-20 md:h-24";
      case "article":
        return "w-full max-w-[300px] mx-auto my-6";
      default:
        return "w-full h-24";
    }
  };

  // Sidebar shows multiple ads stacked vertically
  if (position === "sidebar") {
    return (
      <div className={`${getStyles()} ${className} hidden xl:flex`}>
        {[0, 1, 2].map((offset) => {
          const adIndex = (currentAdIndex + offset) % ads.length;
          const ad = ads[adIndex];
          return (
            <div 
              key={offset}
              className="w-full h-[180px] rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center transition-opacity duration-1000"
            >
              <img 
                src={ad.src} 
                alt={ad.alt}
                className="w-full h-full object-contain p-2"
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Inline/Banner/Article - single rotating ad
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <div className={`${getStyles()} ${className} overflow-hidden rounded-lg bg-muted/10 flex items-center justify-center relative`}>
      {ads.map((ad, index) => (
        <img 
          key={index}
          src={mobileFormat === "horizontal" && ad.mobileSrc ? ad.mobileSrc : ad.src} 
          alt={ad.alt}
          className={`max-w-full max-h-full object-contain absolute transition-opacity duration-1000 p-2 ${
            index === currentAdIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
};

export default InternalAds;
