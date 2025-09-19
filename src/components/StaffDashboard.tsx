import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TaxpayerForm from "./TaxpayerForm";
import TaxpayersList from "./TaxpayersList";
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  nom: string;
  numero_travail: string | null;
  role: string;
  organisation_id: string;
}

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

const StaffDashboard = ({ user, onLogout }: StaffDashboardProps) => {
  const [activeView, setActiveView] = useState<"overview" | "taxpayers" | "add-taxpayer">("overview");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            nom,
            numero_travail,
            organisation_id
          `)
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('organisation_id', profile.organisation_id)
            .single();

          setUserProfile({
            ...profile,
            role: roleData?.role || 'personnel'
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil utilisateur",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user.id, toast]);

  const handleTaxpayerSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('contribuables')
        .insert({
          ...data,
          organisation_id: userProfile?.organisation_id,
          created_by: user.id
        });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer le contribuable",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Contribuable enregistré",
          description: "Les informations ont été sauvegardées avec succès"
        });
        setActiveView("taxpayers");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold">TC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TaxContrib</h1>
              <p className="text-sm text-muted-foreground">
                {userProfile?.role === 'admin' ? 'Administration' : 'Interface Personnel'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userProfile?.nom.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{userProfile?.nom || 'Utilisateur'}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={userProfile?.role === 'admin' ? "destructive" : "secondary"} className="text-xs">
                    {userProfile?.role === 'admin' ? 'Admin' : 'Staff'}
                  </Badge>
                  {userProfile?.numero_travail && (
                    <span className="text-xs text-muted-foreground">#{userProfile.numero_travail}</span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-6 pb-4">
          <div className="flex space-x-4">
            <Button
              variant={activeView === "overview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("overview")}
            >
              📊 Accueil
            </Button>
            <Button
              variant={activeView === "taxpayers" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("taxpayers")}
            >
              👥 Contribuables
            </Button>
            <Button
              variant={activeView === "add-taxpayer" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("add-taxpayer")}
            >
              ➕ Nouveau contribuable
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeView === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Bienvenue {userProfile?.nom}
              </h2>
              <p className="text-muted-foreground">
                {userProfile?.role === 'admin' 
                  ? 'Vous avez les droits administrateur complets'
                  : 'Interface de gestion des contribuables'
                }
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" 
                    onClick={() => setActiveView("add-taxpayer")}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-xl flex items-center justify-center">
                      <span className="text-success-foreground text-2xl">➕</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Nouveau contribuable</h3>
                      <p className="text-sm text-muted-foreground">Enregistrer un nouveau contribuable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" 
                    onClick={() => setActiveView("taxpayers")}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                      <span className="text-primary-foreground text-2xl">👥</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Voir les contribuables</h3>
                      <p className="text-sm text-muted-foreground">Gérer la liste des contribuables</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === "taxpayers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Gestion des Contribuables</h2>
                <p className="text-muted-foreground">Liste des contribuables enregistrés</p>
              </div>
              <Button onClick={() => setActiveView("add-taxpayer")} className="bg-gradient-to-r from-primary to-primary/90">
                ➕ Nouveau contribuable
              </Button>
            </div>
            <TaxpayersList
              userRole={userProfile?.role as "admin" | "personnel" || 'personnel'}
              onValidate={(id) => toast({ title: "Validé", description: "Contribuable validé" })}
              onReject={(id) => toast({ title: "Rejeté", description: "Contribuable rejeté", variant: "destructive" })}
              onEdit={(id) => console.log("Edit:", id)}
              onDelete={(id) => console.log("Delete:", id)}
            />
          </div>
        )}

        {activeView === "add-taxpayer" && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Nouveau Contribuable</h2>
              <p className="text-muted-foreground">Enregistrer un nouveau contribuable dans le système</p>
            </div>
            <TaxpayerForm onSubmit={handleTaxpayerSubmit} />
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;