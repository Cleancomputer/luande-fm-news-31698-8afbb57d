import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Euro } from "lucide-react";

const EconomyWidget = () => {
  const [rates, setRates] = useState<any>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
        const data = await response.json();
        setRates(data);
      } catch (error) {
        console.error("Error fetching economy data:", error);
      }
    };
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: string) => parseFloat(value).toFixed(2);

  const renderRate = (data: any, label: string, code: string, Icon: any) => {
    if (!data) return null;
    const isUp = parseFloat(data.pctChange) >= 0;
    return (
      <div className="relative overflow-hidden rounded-xl p-4 bg-muted border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-bold text-foreground text-lg">{label}</div>
              <div className="text-muted-foreground text-xs">{code}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-foreground text-xl">R$ {formatCurrency(data.bid)}</div>
            <div className={`flex items-center justify-end gap-1 text-sm ${isUp ? 'text-green-600' : 'text-destructive'}`}>
              {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span className="font-semibold">{Math.abs(parseFloat(data.pctChange)).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border border-border shadow-md">
      <CardHeader className="bg-primary pb-3">
        <CardTitle className="flex items-center gap-2 text-primary-foreground">
          <DollarSign className="h-5 w-5" />
          Cotações
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {renderRate(rates?.USDBRL, "Dólar", "USD/BRL", DollarSign)}
        {renderRate(rates?.EURBRL, "Euro", "EUR/BRL", Euro)}
        {!rates && <p className="text-sm text-muted-foreground text-center py-4">Carregando cotações...</p>}
      </CardContent>
    </Card>
  );
};

export default EconomyWidget;
