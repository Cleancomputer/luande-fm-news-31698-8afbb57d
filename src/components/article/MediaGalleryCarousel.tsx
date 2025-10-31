import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaGalleryCarouselProps {
  media: MediaItem[];
  title: string;
}

export const MediaGalleryCarousel = ({ media, title }: MediaGalleryCarouselProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (media.length === 0) return null;

  if (media.length === 1) {
    return (
      <div className="mb-8 rounded-lg overflow-hidden">
        {media[0].type === 'image' ? (
          <>
            <img
              src={media[0].url}
              alt={title}
              className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setSelectedImage(media[0].url)}
            />
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
              <DialogContent className="max-w-7xl w-full p-0 bg-transparent border-none">
                <img
                  src={selectedImage || ''}
                  alt={title}
                  className="w-full h-auto object-contain max-h-[90vh]"
                />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <video
            src={media[0].url}
            className="w-full h-auto"
            controls
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Carousel className="w-full">
          <CarouselContent>
            {media.map((item, index) => (
              <CarouselItem key={index}>
                <div className="rounded-lg overflow-hidden">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={`${title} - Imagem ${index + 1}`}
                      className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setSelectedImage(item.url)}
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-auto"
                      controls
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {media.length} {media.length === 1 ? 'mídia' : 'mídias'} • Use as setas para navegar
        </p>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-7xl w-full p-0 bg-transparent border-none">
          <img
            src={selectedImage || ''}
            alt={title}
            className="w-full h-auto object-contain max-h-[90vh]"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};