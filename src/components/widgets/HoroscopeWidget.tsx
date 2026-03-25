import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";

const signs = [
  { name: "Áries", emoji: "♈", date: "21/03 - 19/04" },
  { name: "Touro", emoji: "♉", date: "20/04 - 20/05" },
  { name: "Gêmeos", emoji: "♊", date: "21/05 - 20/06" },
  { name: "Câncer", emoji: "♋", date: "21/06 - 22/07" },
  { name: "Leão", emoji: "♌", date: "23/07 - 22/08" },
  { name: "Virgem", emoji: "♍", date: "23/08 - 22/09" },
  { name: "Libra", emoji: "♎", date: "23/09 - 22/10" },
  { name: "Escorpião", emoji: "♏", date: "23/10 - 21/11" },
  { name: "Sagitário", emoji: "♐", date: "22/11 - 21/12" },
  { name: "Capricórnio", emoji: "♑", date: "22/12 - 19/01" },
  { name: "Aquário", emoji: "♒", date: "20/01 - 18/02" },
  { name: "Peixes", emoji: "♓", date: "19/02 - 20/03" },
];

const predictions: Record<string, string[]> = {
  "Áries": ["Dia de muita energia! Aproveite para iniciar projetos.", "Cuidado com impulsividade nas decisões."],
  "Touro": ["Foco em finanças hoje. Bons resultados à vista.", "Momento de valorizar quem está ao seu lado."],
  "Gêmeos": ["Comunicação fluida, bom dia para networking.", "Novas ideias surgirão, anote todas!"],
  "Câncer": ["Cuide das suas emoções com carinho.", "Família traz boas notícias hoje."],
  "Leão": ["Brilhe! Seu carisma está em alta.", "Lidere com o coração e conquiste respeito."],
  "Virgem": ["Organização é a chave do sucesso hoje.", "Detalhes farão toda a diferença."],
  "Libra": ["Harmonia nos relacionamentos. Dia leve.", "Busque equilíbrio entre trabalho e lazer."],
  "Escorpião": ["Transformações positivas no horizonte.", "Confie na sua intuição, ela está certeira."],
  "Sagitário": ["Aventura e novos conhecimentos te esperam.", "Mente aberta traz oportunidades incríveis."],
  "Capricórnio": ["Trabalho duro traz recompensas visíveis.", "Persista, o sucesso está próximo."],
  "Aquário": ["Inovação e criatividade em alta.", "Conecte-se com pessoas que pensam diferente."],
  "Peixes": ["Espiritualidade e arte nutrem sua alma.", "Sonhe grande, o universo conspira a seu favor."],
};

const HoroscopeWidget = () => {
  const [selectedSign, setSelectedSign] = useState("");
  const [horoscope, setHoroscope] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");

  const getHoroscope = (signName: string) => {
    const sign = signs.find((s) => s.name === signName);
    setSelectedEmoji(sign?.emoji || "");
    const preds = predictions[signName] || ["Dia favorável para novos começos."];
    const dayIndex = new Date().getDate() % preds.length;
    setHoroscope(preds[dayIndex]);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5" />
          Horóscopo
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <Select
          value={selectedSign}
          onValueChange={(value) => {
            setSelectedSign(value);
            getHoroscope(value);
          }}
        >
          <SelectTrigger className="border-purple-200 focus:ring-purple-400">
            <SelectValue placeholder="✨ Selecione seu signo" />
          </SelectTrigger>
          <SelectContent>
            {signs.map((sign) => (
              <SelectItem key={sign.name} value={sign.name}>
                {sign.emoji} {sign.name} ({sign.date})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {horoscope && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
            <div className="text-3xl text-center mb-2">{selectedEmoji}</div>
            <p className="text-sm leading-relaxed text-center italic">{horoscope}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HoroscopeWidget;
