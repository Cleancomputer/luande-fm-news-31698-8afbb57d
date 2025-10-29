import { Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface NewsCarouselProps {
  items: {
    title: string;
    excerpt: string;
    image: string;
    category: string;
    author: string;
    date: string;
    slug?: string;
  }[];
  onArticleClick?: (slug: string) => void;
}

const NewsCarousel = ({ items, onArticleClick }: NewsCarouselProps) => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div onClick={() => item.slug && onArticleClick?.(item.slug)} className="cursor-pointer h-full">
              <Card className="overflow-hidden h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group/card">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm hover:bg-primary animate-fade-in">
                    {item.category}
                  </Badge>

                  <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover/card:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-200 mb-3 line-clamp-2 opacity-90">
                      {item.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-300">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                  </div>
                </div>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
};

export default NewsCarousel;
