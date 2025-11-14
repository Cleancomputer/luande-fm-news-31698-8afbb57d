import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const EconomyWidget = () => {
  const [rates, setRates] = useState<any>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Using AwesomeAPI for Brazilian currency rates (free)
        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
        const data = await response.json();
        setRates(data);
      } catch (error) {
        console.error("Error fetching economy data:", error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: string) => {
    return parseFloat(value).toFixed(2);
  };

  const getTrend = (variation: string) => {
    const value = parseFloat(variation);
    return value >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cotações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rates?.USDBRL && (
          <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
            <div>
              <div className="font-semibold">Dólar</div>
              <div className="text-sm text-muted-foreground">USD/BRL</div>
            </div>
            <div className="text-right">
              <div className="font-bold">R$ {formatCurrency(rates.USDBRL.bid)}</div>
              <div className="flex items-center gap-1 text-sm">
                {getTrend(rates.USDBRL.pctChange)}
                <span>{Math.abs(parseFloat(rates.USDBRL.pctChange)).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}

        {rates?.EURBRL && (
          <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
            <div>
              <div className="font-semibold">Euro</div>
              <div className="text-sm text-muted-foreground">EUR/BRL</div>
            </div>
            <div className="text-right">
              <div className="font-bold">R$ {formatCurrency(rates.EURBRL.bid)}</div>
              <div className="flex items-center gap-1 text-sm">
                {getTrend(rates.EURBRL.pctChange)}
                <span>{Math.abs(parseFloat(rates.EURBRL.pctChange)).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EconomyWidget;
