import vivoEmpresas from "@/assets/ads/vivo-empresas.png";
import bradescoSeguros from "@/assets/ads/bradesco-seguros.png";
import bradesco from "@/assets/ads/bradesco.png";

interface Ad {
  src: string;
  alt: string;
  link: string;
}

const ads: Ad[] = [
  { src: vivoEmpresas, alt: "Vivo Empresas", link: "https://vivo.com.br/para-empresas" },
  { src: bradescoSeguros, alt: "Bradesco Seguros", link: "https://www.bradescoseguros.com.br/clientes" },
  { src: bradesco, alt: "Banco Bradesco", link: "https://banco.bradesco/html/classic/index.shtm" },
];

const HorizontalAdsStrip = () => {
  return (
    <div className="hidden lg:flex justify-center items-center gap-6 py-4 my-6 bg-muted/20 rounded-xl">
      {ads.map((ad, index) => (
        <a
          key={index}
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-[180px] h-[120px] rounded-lg overflow-hidden bg-background/90 backdrop-blur-sm shadow-lg border border-border/50 transition-all duration-500 hover:scale-105 hover:shadow-xl"
        >
          <img 
            src={ad.src} 
            alt={ad.alt}
            className="w-full h-full object-contain p-3"
          />
        </a>
      ))}
    </div>
  );
};

export default HorizontalAdsStrip;
