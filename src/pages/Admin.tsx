import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Dashboard from "@/components/admin/Dashboard";
import ContentManager from "@/components/admin/content/ContentManager";
import PublishedArticles from "@/components/admin/PublishedArticles";
import PollsManager from "@/components/admin/PollsManager";
import InstagramConfig from "@/components/admin/InstagramConfig";
import Analytics from "@/components/admin/Analytics";
import Notifications from "@/components/admin/Notifications";
import Reports from "@/components/admin/Reports";
import SettingsManager from "@/components/admin/SettingsManager";
import MessagesManager from "@/components/admin/MessagesManager";
import SubmissionsManager from "@/components/admin/SubmissionsManager";
import CategoriesManager from "@/components/admin/CategoriesManager";
import { EventsManager } from "@/components/admin/EventsManager";
import Designer from "@/components/admin/Designer";

type UserRole = 'admin' | 'editor' | null;

const Admin = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data || (data.role !== 'admin' && data.role !== 'editor')) {
          toast.error("Acesso negado. Você não tem permissão.");
          navigate("/");
          return;
        }

        setUserRole(data.role as UserRole);
      } catch (error) {
        console.error('Erro ao verificar role:', error);
        toast.error("Erro ao verificar permissões");
        navigate("/");
      } finally {
        setCheckingRole(false);
      }
    };

    if (!loading) {
      checkUserRole();
    }
  }, [user, loading, navigate]);

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    
    setSigningOut(true);
    try {
      // Tenta fazer logout, mas mesmo com erro, limpa a sessão local
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.log('Logout error (ignorado):', error);
    }
    
    // Sempre redireciona para login, independente do resultado
    toast.success("Logout realizado com sucesso");
    setSigningOut(false);
    navigate("/login", { replace: true });
  };

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar userRole={userRole} />
      
      {/* Main Content - com margem para o sidebar */}
      <div className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="ml-16 lg:ml-0">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Painel {isAdmin ? 'Administrativo' : 'do Editor'}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.open("/", "_blank")} 
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30"
              >
                <span className="hidden sm:inline">Ver Portal</span>
                <span className="sm:hidden">Portal</span>
              </Button>
              <Button 
                onClick={handleSignOut} 
                variant="outline"
                disabled={signingOut}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                {signingOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            {isAdmin ? (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/content" element={<ContentManager />} />
                <Route path="/published" element={<PublishedArticles />} />
                <Route path="/polls" element={<PollsManager />} />
                <Route path="/events" element={<EventsManager />} />
                <Route path="/designer" element={<Designer />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/instagram" element={<InstagramConfig />} />
                <Route path="/messages" element={<MessagesManager />} />
                <Route path="/submissions" element={<SubmissionsManager />} />
                <Route path="/categories" element={<CategoriesManager />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<SettingsManager />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Navigate to="/admin/content" replace />} />
                <Route path="/content" element={<ContentManager />} />
                <Route path="*" element={<Navigate to="/admin/content" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Admin;
