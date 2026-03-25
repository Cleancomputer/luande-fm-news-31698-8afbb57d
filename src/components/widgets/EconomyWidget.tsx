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

  const renderRate = (data: any, label: string, code: string, Icon: any, gradient: string) => {
    if (!data) return null;
    const isUp = parseFloat(data.pctChange) >= 0;
    return (
      <div className={`relative overflow-hidden rounded-xl p-4 ${gradient}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">{label}</div>
              <div className="text-white/70 text-xs">{code}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-white text-xl">R$ {formatCurrency(data.bid)}</div>
            <div className={`flex items-center justify-end gap-1 text-sm ${isUp ? 'text-green-200' : 'text-red-200'}`}>
              {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span className="font-semibold">{Math.abs(parseFloat(data.pctChange)).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <DollarSign className="h-5 w-5" />
          Cotações
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {renderRate(rates?.USDBRL, "Dólar", "USD/BRL", DollarSign, "bg-gradient-to-r from-blue-600 to-blue-700")}
        {renderRate(rates?.EURBRL, "Euro", "EUR/BRL", Euro, "bg-gradient-to-r from-indigo-600 to-indigo-700")}
        {!rates && <p className="text-sm text-muted-foreground text-center py-4">Carregando cotações...</p>}
      </CardContent>
    </Card>
  );
};

export default EconomyWidget;
