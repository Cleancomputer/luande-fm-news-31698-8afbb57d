import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const SettingsManager = () => {
  const [instagramUrl, setInstagramUrl] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_config')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setInstagramUrl(data.instagram_url);
        setConfigId(data.id);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (configId) {
        const { error } = await supabase
          .from('instagram_config')
          .update({ instagram_url: instagramUrl })
          .eq('id', configId);

        if (error) throw error;
        toast.success("Configuração atualizada com sucesso!");
      } else {
        const { data, error } = await supabase
          .from('instagram_config')
          .insert({ instagram_url: instagramUrl })
          .select()
          .single();

        if (error) throw error;
        setConfigId(data.id);
        toast.success("Configuração salva com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error("Erro ao salvar configuração");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações do portal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instagram</CardTitle>
          <CardDescription>Configure a integração com Instagram</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram-url">URL do Instagram</Label>
              <Input
                id="instagram-url"
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/..."
                required
              />
            </div>
            <Button type="submit">Salvar Configurações</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Portal</CardTitle>
          <CardDescription>Configurações gerais do site</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Mais opções de configuração serão adicionadas em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
