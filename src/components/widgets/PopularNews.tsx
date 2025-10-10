import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PopularNewsItem {
  title: string;
  views: string;
}

const popularNews: PopularNewsItem[] = [
  { title: "Nova tecnologia promete revolucionar energia solar", views: "15k" },
  { title: "Campeonato nacional tem novo líder após rodada emocionante", views: "12k" },
  { title: "Festival de música reúne milhares de pessoas", views: "10k" },
  { title: "Mudanças climáticas: especialistas alertam para consequências", views: "9k" },
  { title: "Novos investimentos em infraestrutura são anunciados", views: "8k" }
];

const PopularNews = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-destructive" />
          Mais Lidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {popularNews.map((news, index) => (
            <li key={index} className="group cursor-pointer">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary smooth-transition mb-1">
                    {news.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">{news.views} visualizações</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PopularNews;
