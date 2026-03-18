import { Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface NewsCardProps {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  featured?: boolean;
}

const NewsCard = ({ 
  title, 
  excerpt, 
  image, 
  category, 
  author, 
  date,
  featured = false 
}: NewsCardProps) => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <Card 
      ref={elementRef}
      className={`overflow-hidden hover-lift smooth-transition group cursor-pointer h-full border-0 shadow-sm hover:shadow-md ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? 'h-72' : 'h-44'}`}>
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute top-3 left-3 category-label bg-primary/90 text-primary-foreground px-2 py-0.5 rounded text-[11px]">
          {category}
        </span>
      </div>
      <CardContent className="p-4">
        <h3 className={`font-bold mb-2 line-clamp-2 group-hover:text-primary smooth-transition font-display leading-snug ${featured ? 'text-xl' : 'text-base'}`}>
          {title}
        </h3>
        <p className={`text-muted-foreground mb-3 font-body ${featured ? 'line-clamp-3 text-sm' : 'line-clamp-2 text-xs'}`}>
          {excerpt}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{date}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
