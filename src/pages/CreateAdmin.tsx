import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CreateAdmin = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAdmin = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {}
      });

      if (error) {
        toast.error(`Erro: ${error.message}`);
      } else if (data.success) {
        toast.success(data.message);
        toast.success("Login: admin@admin.com | Senha: admin123");
      } else {
        toast.error(data.error || "Erro desconhecido");
      }
    } catch (err) {
      toast.error("Erro ao criar usuário admin");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Criar Usuário Admin</CardTitle>
          <CardDescription>
            Crie o usuário administrador do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Credenciais que serão criadas:</p>
              <p className="text-sm text-muted-foreground">Email: admin@admin.com</p>
              <p className="text-sm text-muted-foreground">Senha: admin123</p>
            </div>
            <Button 
              onClick={handleCreateAdmin} 
              className="w-full" 
              disabled={isCreating}
            >
              {isCreating ? "Criando..." : "Criar Usuário Admin"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdmin;
