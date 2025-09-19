import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import TaxpayerForm from "./TaxpayerForm";
import TaxpayersList from "./TaxpayersList";
import { useToast } from "@/hooks/use-toast";

const StaffDashboard = () => {
  const [activeView, setActiveView] = useState<"overview" | "taxpayers" | "register">("overview");
  const { authUser, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  const handleTaxpayerSubmit = (data: any) => {
    console.log("Nouvelle soumission contribuable:", data);
    toast({
      title: "Contribuable enregistré",
      description: "Les informations ont été sauvegardées avec succès",
    });
    setActiveView("taxpayers");
  };

  const handleValidate = (id: string) => {
    toast({
      title: "Contribuable validé",
      description: "Le statut a été mis à jour",
    });
  };

  const handleReject = (id: string) => {
    toast({
      title: "Contribuable rejeté",
      description: "Le statut a été mis à jour",
      variant: "destructive",
    });
  };

  if (!authUser) return null;

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
              <p className="text-sm text-muted-foreground">Gestion des contribuables</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {authUser.profile.nom.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{authUser.profile.nom}</p>
                <Badge variant={authUser.role.role === "admin" ? "destructive" : "secondary"} className="text-xs">
                  {authUser.role.role === "admin" ? "Admin" : "Staff"}
                </Badge>
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
              📊 Vue d'ensemble
            </Button>
            <Button
              variant={activeView === "taxpayers" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("taxpayers")}
            >
              👥 Contribuables
            </Button>
            <Button
              variant={activeView === "register" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("register")}
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Tableau de bord</h2>
              <p className="text-muted-foreground">Bienvenue {authUser.profile.nom}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" 
                    onClick={() => setActiveView("register")}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                      <span className="text-primary-foreground text-2xl">➕</span>
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
                    <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary/80 rounded-xl flex items-center justify-center">
                      <span className="text-secondary-foreground text-2xl">👥</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Gérer les contribuables</h3>
                      <p className="text-sm text-muted-foreground">Voir et modifier les contribuables</p>
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
                <p className="text-muted-foreground">Liste et gestion des contribuables enregistrés</p>
              </div>
              <Button onClick={() => setActiveView("register")} className="bg-gradient-to-r from-primary to-primary/90">
                ➕ Nouveau contribuable
              </Button>
            </div>

            <TaxpayersList
              userRole={authUser.role.role}
              onValidate={handleValidate}
              onReject={handleReject}
              onEdit={(id) => console.log("Edit:", id)}
              onDelete={(id) => console.log("Delete:", id)}
            />
          </div>
        )}

        {activeView === "register" && (
          <div className="max-w-4xl">
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