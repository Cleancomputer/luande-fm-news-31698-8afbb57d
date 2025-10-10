import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

interface NewsCarouselItem {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
}

interface NewsCarouselProps {
  items: NewsCarouselItem[];
}

const NewsCarousel = ({ items }: NewsCarouselProps) => {
  return (
    <div className="w-full relative group">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group/card">
                <div className="relative h-64 overflow-hidden">
                  {/* Image with zoom effect */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  {/* Category badge */}
                  <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm hover:bg-primary animate-fade-in">
                    {item.category}
                  </Badge>

                  {/* Content overlay */}
                  <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover/card:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-200 mb-3 line-clamp-2 opacity-90">
                      {item.excerpt}
                    </p>
                    
                    {/* Meta info */}
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

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation arrows with modern styling */}
        <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm hover:bg-background" />
        <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm hover:bg-background" />
      </Carousel>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default NewsCarousel;
