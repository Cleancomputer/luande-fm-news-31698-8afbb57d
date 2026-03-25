import { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";

const dailyQuotes = [
  { quote: "A felicidade não é algo pronto. Ela vem das suas próprias ações.", author: "Dalai Lama" },
  { quote: "O sucesso é a soma de pequenos esforços repetidos dia após dia.", author: "Robert Collier" },
  { quote: "Seja a mudança que você deseja ver no mundo.", author: "Mahatma Gandhi" },
  { quote: "A vida é o que acontece enquanto você faz outros planos.", author: "John Lennon" },
  { quote: "Acredite que você pode e já está no meio do caminho.", author: "Theodore Roosevelt" },
  { quote: "O único modo de fazer um excelente trabalho é amar o que você faz.", author: "Steve Jobs" },
  { quote: "Grandes coisas nunca vieram de zonas de conforto.", author: "Neil Strauss" },
  { quote: "Não espere por uma crise para descobrir o que é importante.", author: "Platão" },
  { quote: "A educação é a arma mais poderosa para mudar o mundo.", author: "Nelson Mandela" },
  { quote: "Cada dia é uma nova chance para mudar sua vida.", author: "Provérbio" },
  { quote: "A persistência é o caminho do êxito.", author: "Charles Chaplin" },
  { quote: "Só sei que nada sei, e o fato de saber isso me coloca em vantagem.", author: "Sócrates" },
  { quote: "A imaginação é mais importante que o conhecimento.", author: "Albert Einstein" },
  { quote: "A coragem não é a ausência do medo, mas o triunfo sobre ele.", author: "Nelson Mandela" },
  { quote: "Nossas maiores fraquezas residem em desistir.", author: "Thomas Edison" },
  { quote: "O futuro pertence àqueles que acreditam na beleza de seus sonhos.", author: "Eleanor Roosevelt" },
];

const imageThemes = [
  "sunrise over ocean with golden light",
  "mountain landscape with morning mist",
  "peaceful forest path with sunlight",
  "colorful wildflowers in a green meadow",
  "serene lake reflecting mountains",
  "dramatic sunset clouds over countryside",
  "tropical beach with crystal clear water",
  "autumn leaves in a beautiful park",
];

const DailyImages = () => {
  const [items, setItems] = useState<{ imageUrl: string; quote: string; author: string }[]>([]);

  useEffect(() => {
    generateDailyItems();
  }, []);

  const generateDailyItems = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );

    const result = [];
    for (let i = 0; i < 4; i++) {
      const quoteIndex = (dayOfYear * 4 + i) % dailyQuotes.length;
      const imageIndex = (dayOfYear * 4 + i) % imageThemes.length;
      
      // Use Unsplash for beautiful daily images (free, no API key)
      const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(imageThemes[imageIndex])}&sig=${dayOfYear + i}`;

      result.push({
        imageUrl,
        quote: dailyQuotes[quoteIndex].quote,
        author: dailyQuotes[quoteIndex].author,
      });
    }
    setItems(result);
  };

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 border-b-2 border-primary pb-2">
        <h2 className="section-title">
          <span className="section-divider"></span>
          📸 Imagens do Dia
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden group aspect-[4/3]"
          >
            <img
              src={item.imageUrl}
              alt={`Imagem do dia ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-xs sm:text-sm font-medium italic leading-snug line-clamp-3">
                "{item.quote}"
              </p>
              <p className="text-white/70 text-xs mt-1">— {item.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DailyImages;
