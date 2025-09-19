import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import AuthLayout from "@/components/AuthLayout";
import AuthForm from "@/components/AuthForm";
import StaffDashboard from "@/components/StaffDashboard";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue dans l'application",
          });
        }
        
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Déconnexion",
            description: "Vous avez été déconnecté avec succès",
          });
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleAuthSuccess = () => {
    // Auth state change will handle the rest
  };

  const handleLogout = () => {
    setUser(null);
    setSession(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas connecté, afficher la page d'authentification
  if (!user || !session) {
    return (
      <AuthLayout
        title="TaxContrib"
        subtitle="Système de gestion des contribuables"
      >
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </AuthLayout>
    );
  }

  return <StaffDashboard user={user} onLogout={handleLogout} />;
};

export default Index;
