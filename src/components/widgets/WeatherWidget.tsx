import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Cloud, Search, MapPin } from "lucide-react";

const WeatherWidget = () => {
  const [city, setCity] = useState("Aracaju");
  const [inputCity, setInputCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherByCity("Aracaju");
  }, []);

  const fetchWeatherByCity = async (searchCity: string) => {
    if (!searchCity.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First, get coordinates from city name using Open-Meteo Geocoding API
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=1&language=pt&format=json`
      );
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        setError("Cidade não encontrada");
        setLoading(false);
        return;
      }
      
      const { latitude, longitude, name, admin1 } = geoData.results[0];
      
      // Then fetch weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=America/Sao_Paulo`
      );
      const weatherData = await weatherResponse.json();
      
      setWeather(weatherData);
      setCity(admin1 ? `${name}, ${admin1}` : name);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("Erro ao buscar previsão");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      fetchWeatherByCity(inputCity);
      setInputCity("");
    }
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
            placeholder="Digite o nome da cidade"
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
        ) : error ? (
          <div className="text-center py-4 text-destructive">
            {error}
          </div>
        ) : weather?.current && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {city}
            </div>
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
