import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Instagram } from "lucide-react";

const InstagramConfig = () => {
  const [instagramUrl, setInstagramUrl] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data, error } = await supabase
      .from('instagram_config')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error("Erro ao carregar configuração:", error);
      return;
    }

    if (data) {
      setInstagramUrl(data.instagram_url);
      setConfigId(data.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (configId) {
      const { error } = await supabase
        .from('instagram_config')
        .update({ instagram_url: instagramUrl })
        .eq('id', configId);

      if (error) {
        toast.error("Erro ao atualizar Instagram");
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('instagram_config')
        .insert([{ instagram_url: instagramUrl }])
        .select()
        .single();

      if (error) {
        toast.error("Erro ao salvar Instagram");
        return;
      }

      setConfigId(data.id);
    }

    toast.success("Instagram atualizado com sucesso!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="w-5 h-5" />
          Configuração do Instagram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">URL do Instagram Profissional</Label>
            <Input
              id="instagram"
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/seu_perfil"
              required
            />
            <p className="text-sm text-muted-foreground">
              Cole a URL completa do seu perfil profissional do Instagram
            </p>
          </div>
          <Button type="submit">Salvar Configuração</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InstagramConfig;
