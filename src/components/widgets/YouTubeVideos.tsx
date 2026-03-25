import { useState, useEffect } from "react";
import { Play } from "lucide-react";

const CHANNEL_ID = "UCS35bHapJqRtfG9kcq9f9FA";
const CACHE_KEY = "luande_yt_videos";
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

interface CachedData {
  videos: { id: string; title: string }[];
  timestamp: number;
}

const YouTubeVideos = () => {
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    // Check cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: CachedData = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_DURATION && data.videos.length > 0) {
          setVideos(data.videos.slice(0, 2));
          return;
        }
      }
    } catch {}

    // Fetch latest videos from YouTube RSS feed (no API key needed)
    try {
      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)}`
      );
      const text = await response.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      const entries = xml.querySelectorAll("entry");

      const fetchedVideos: { id: string; title: string }[] = [];
      entries.forEach((entry, i) => {
        if (i >= 4) return;
        const videoId = entry.querySelector("yt\\:videoId, videoId")?.textContent;
        const title = entry.querySelector("title")?.textContent;
        if (videoId && title) {
          fetchedVideos.push({ id: videoId, title });
        }
      });

      if (fetchedVideos.length > 0) {
        setVideos(fetchedVideos.slice(0, 2));
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ videos: fetchedVideos, timestamp: Date.now() })
        );
      }
    } catch (error) {
      console.error("Erro ao carregar vídeos do YouTube:", error);
      // Fallback to hardcoded videos
      setVideos([
        { id: "fizu3ynz-pk", title: "Vídeo em Destaque 1" },
        { id: "SAotJezU9qA", title: "Vídeo em Destaque 2" },
      ]);
    }
  };

  if (videos.length === 0) return null;

  return (
    <section className="container mx-auto px-4 my-10">
      <div className="flex items-center gap-3 mb-5 border-b-2 border-destructive pb-2">
        <Play className="h-5 w-5 text-destructive" />
        <h2 className="section-title">Vídeos em Destaque</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {videos.map((video) => (
          <div key={video.id}>
            <div className="aspect-video rounded overflow-hidden shadow-md">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-sm font-medium mt-2 line-clamp-2 font-body">{video.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default YouTubeVideos;
