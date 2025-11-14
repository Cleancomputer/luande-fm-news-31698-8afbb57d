import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Cloud, Search } from "lucide-react";

const WeatherWidget = () => {
  const [city, setCity] = useState("Aracaju");
  const [inputCity, setInputCity] = useState("Aracaju");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const cityCoordinates: Record<string, { lat: number; lon: number }> = {
    "aracaju": { lat: -10.9472, lon: -37.0731 },
    "são paulo": { lat: -23.5505, lon: -46.6333 },
    "rio de janeiro": { lat: -22.9068, lon: -43.1729 },
    "brasília": { lat: -15.7801, lon: -47.9292 },
    "salvador": { lat: -12.9714, lon: -38.5014 },
    "fortaleza": { lat: -3.7319, lon: -38.5267 },
    "recife": { lat: -8.0476, lon: -34.8770 },
    "manaus": { lat: -3.1190, lon: -60.0217 },
    "curitiba": { lat: -25.4284, lon: -49.2733 },
    "porto alegre": { lat: -30.0346, lon: -51.2177 }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const fetchWeather = async (searchCity: string) => {
    setLoading(true);
    try {
      const normalizedCity = searchCity.toLowerCase().trim();
      const coords = cityCoordinates[normalizedCity] || cityCoordinates["aracaju"];
      
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=America/Sao_Paulo`
      );
      const data = await response.json();
      setWeather(data);
      setCity(searchCity);
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(inputCity);
  };

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
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)}
            placeholder="Digite a cidade"
            className="flex-1"
          />
          <button type="submit" className="p-2 hover:bg-muted rounded-md transition-colors">
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>
        </form>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : weather?.current && (
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
