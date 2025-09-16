import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/AuthLayout";
import LoginForm from "@/components/LoginForm";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardStats from "@/components/DashboardStats";
import TaxpayerForm from "@/components/TaxpayerForm";
import TaxpayersList from "@/components/TaxpayersList";

const Index = () => {
  const [user, setUser] = useState<{
    role: "admin" | "personnel";
    workNumber: string;
    name: string;
  } | null>(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const { toast } = useToast();

  const handleLogin = (role: "admin" | "personnel", workNumber: string) => {
    // Simulation de connexion
    setUser({
      role,
      workNumber,
      name: role === "admin" ? "Administrateur Système" : "Agent Personnel"
    });
    toast({
      title: "Connexion réussie",
      description: `Bienvenue ${role === "admin" ? "Administrateur" : "Agent"}`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("dashboard");
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
    setCurrentView("taxpayers");
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

  // Si pas connecté, afficher la page de connexion
  if (!user) {
    return (
      <AuthLayout
        title="TaxContrib"
        subtitle="Système de gestion des contribuables"
      >
        <LoginForm onLogin={handleLogin} />
      </AuthLayout>
    );
  }

  // Contenu du dashboard selon la vue active
  const renderDashboardContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="p-6 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Tableau de bord
              </h1>
              <p className="text-muted-foreground">
                Vue d'ensemble de votre activité
              </p>
            </div>
            <DashboardStats userRole={user.role} />
          </div>
        );

      case "taxpayers":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gestion des contribuables
              </h1>
              <p className="text-muted-foreground">
                Liste et gestion des contribuables enregistrés
              </p>
            </div>
            <TaxpayersList
              userRole={user.role}
              onValidate={handleValidate}
              onReject={handleReject}
              onEdit={(id) => console.log("Edit:", id)}
              onDelete={(id) => console.log("Delete:", id)}
            />
          </div>
        );

      case "register":
        return (
          <TaxpayerForm onSubmit={handleTaxpayerSubmit} />
        );

      default:
        return (
          <div className="p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Fonctionnalité en développement
              </h2>
              <p className="text-muted-foreground">
                Cette section sera bientôt disponible
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default Index;
