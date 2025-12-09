import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'editor' | null;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    // Configurar listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Limpar sessão inválida
        if (event === 'TOKEN_REFRESHED' && !session) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Buscar role do usuário
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          
          setUserRole(roleData?.role as UserRole || null);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Depois verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      // Se houver erro de token, limpar sessão
      if (error) {
        console.log('Sessão inválida, limpando...', error);
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Buscar role do usuário
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setUserRole(roleData?.role as UserRole || null);
      }
      
      setLoading(false);
    }).catch(async (error) => {
      console.log('Erro ao recuperar sessão:', error);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setUserRole(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    userRole,
    signIn,
    signUp,
    signOut,
  };
};
