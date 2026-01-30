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
    <div className="hidden lg:flex justify-center items-center gap-4 py-3 my-4 bg-muted/10 rounded-lg">
      {ads.map((ad, index) => (
        <a
          key={index}
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-[200px] h-[60px] rounded-md overflow-hidden bg-background shadow-md border border-border/30 transition-all duration-300 hover:scale-102 hover:shadow-lg"
        >
          <img 
            src={ad.src} 
            alt={ad.alt}
            className="w-full h-full object-contain"
          />
        </a>
      ))}
    </div>
  );
};

export default HorizontalAdsStrip;
