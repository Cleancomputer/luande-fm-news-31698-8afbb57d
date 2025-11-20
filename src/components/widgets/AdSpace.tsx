import { Card } from "@/components/ui/card";
import adBoaluz from "@/assets/ad-boaluz.jpg";

interface AdSpaceProps {
  position: "header" | "sidebar" | "content" | "footer";
  className?: string;
}

const AdSpace = ({ position, className = "" }: AdSpaceProps) => {
  const dimensions = {
    header: "w-full h-24 md:h-28",
    sidebar: "w-full h-64",
    content: "w-full h-32",
    footer: "w-full h-24"
  };

  // Usar a imagem do anunciante apenas para o espaço header
  if (position === "header") {
    return (
      <div className={`${dimensions[position]} ${className} overflow-hidden rounded-lg bg-muted/20 flex items-center justify-center`}>
        <img 
          src={adBoaluz} 
          alt="Ótica & Joalheria Boa Luz" 
          className="w-full h-full object-contain"
        />
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
