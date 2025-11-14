import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Cloud, Search } from "lucide-react";

const WeatherWidget = () => {
  const [city, setCity] = useState("Aracaju");
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    // Using OpenWeatherMap API (free tier)
    // Note: In production, this should use an edge function with API key
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=-10.9472&longitude=-37.0731&current=temperature_2m,relative_humidity_2m,weather_code&timezone=America/Sao_Paulo`
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    fetchWeather();
  }, [city]);

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Céu limpo";
    if (code <= 3) return "Parcialmente nublado";
    if (code <= 48) return "Nublado";
    if (code <= 67) return "Chuva";
    return "Tempestade";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Previsão do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Cidade"
            className="flex-1"
          />
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        
        {weather?.current && (
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">
              {Math.round(weather.current.temperature_2m)}°C
            </div>
            <div className="text-muted-foreground">
              {getWeatherDescription(weather.current.weather_code)}
            </div>
            <div className="text-sm text-muted-foreground">
              Umidade: {weather.current.relative_humidity_2m}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
