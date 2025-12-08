import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CreateAdmin = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUsers = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {}
      });

      if (error) {
        toast.error(`Erro: ${error.message}`);
      } else if (data.success) {
        toast.success(data.message);
        data.results?.forEach((result: any) => {
          if (result.status === 'created') {
            toast.success(`${result.email} criado como ${result.role}`);
          } else {
            toast.info(`${result.email}: ${result.message || result.status}`);
          }
        });
      } else {
        toast.error(data.error || "Erro desconhecido");
      }
    } catch (err) {
      toast.error("Erro ao criar usuários");
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
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Criar Usuários do Sistema</CardTitle>
          <CardDescription>
            Crie os usuários administrador e editor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">Administrador:</p>
              </div>
              <div className="pl-6">
                <p className="text-sm text-muted-foreground">Email: djalmeidajunior@gmail.com</p>
                <p className="text-sm text-muted-foreground">Senha: 2728</p>
                <p className="text-xs text-green-600 mt-1">Acesso total ao painel</p>
              </div>
              
              <div className="border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <p className="text-sm font-medium">Editor/Colaborador:</p>
                </div>
                <div className="pl-6">
                  <p className="text-sm text-muted-foreground">Email: colaborador@luande.com</p>
                  <p className="text-sm text-muted-foreground">Senha: admin123@</p>
                  <p className="text-xs text-blue-600 mt-1">Acesso apenas ao módulo Conteúdo</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleCreateUsers} 
              className="w-full" 
              disabled={isCreating}
            >
              {isCreating ? "Criando..." : "Criar Usuários"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdmin;
