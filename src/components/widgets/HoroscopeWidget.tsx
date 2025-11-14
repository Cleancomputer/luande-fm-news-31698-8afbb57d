import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";

const signs = [
  { name: "Áries", date: "21/03 - 19/04" },
  { name: "Touro", date: "20/04 - 20/05" },
  { name: "Gêmeos", date: "21/05 - 20/06" },
  { name: "Câncer", date: "21/06 - 22/07" },
  { name: "Leão", date: "23/07 - 22/08" },
  { name: "Virgem", date: "23/08 - 22/09" },
  { name: "Libra", date: "23/09 - 22/10" },
  { name: "Escorpião", date: "23/10 - 21/11" },
  { name: "Sagitário", date: "22/11 - 21/12" },
  { name: "Capricórnio", date: "22/12 - 19/01" },
  { name: "Aquário", date: "20/01 - 18/02" },
  { name: "Peixes", date: "19/02 - 20/03" }
];

const HoroscopeWidget = () => {
  const [selectedSign, setSelectedSign] = useState("");
  const [horoscope, setHoroscope] = useState("");

  const getHoroscope = (sign: string) => {
    // Simplified horoscope predictions
    const predictions = [
      "Dia favorável para novos começos. Sua energia estará elevada.",
      "Momento de reflexão. Preste atenção aos sinais ao seu redor.",
      "Ótimo dia para relacionamentos. Demonstre afeto aos que ama.",
      "Foco no trabalho trará recompensas. Mantenha-se dedicado.",
      "Cuide da sua saúde hoje. Um momento de descanso será bem-vindo.",
      "Novidades financeiras no horizonte. Fique atento às oportunidades."
    ];
    
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    setHoroscope(randomPrediction);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Horóscopo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedSign}
          onValueChange={(value) => {
            setSelectedSign(value);
            getHoroscope(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione seu signo" />
          </SelectTrigger>
          <SelectContent>
            {signs.map((sign) => (
              <SelectItem key={sign.name} value={sign.name}>
                {sign.name} ({sign.date})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {horoscope && (
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm leading-relaxed">{horoscope}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HoroscopeWidget;
