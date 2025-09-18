import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthLayout from "@/components/AuthLayout";
import LoginForm from "@/components/LoginForm";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardStats from "@/components/DashboardStats";
import TaxpayerForm from "@/components/TaxpayerForm";
import TaxpayersList from "@/components/TaxpayersList";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeesList from "@/components/EmployeesList";
import WelcomeCard from "@/components/WelcomeCard";

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

  const handleEmployeeSubmit = (data: any) => {
    console.log("Nouvelle soumission employé:", data);
    toast({
      title: "Employé enregistré",
      description: "L'employé a été ajouté avec succès au système",
    });
    setCurrentView("staff");
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
            {/* Carte de bienvenue personnalisée */}
            <WelcomeCard user={user} onNavigate={setCurrentView} />

            {/* Actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full">
                <h2 className="text-xl font-semibold text-foreground mb-4">Actions rapides</h2>
              </div>
              
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setCurrentView("register")}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Nouveau contribuable</h3>
                      <p className="text-sm text-muted-foreground">Enregistrer un nouveau contribuable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user.role === "admin" && (
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setCurrentView("add-employee")}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Nouvel employé</h3>
                        <p className="text-sm text-muted-foreground">Ajouter un employé au système</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setCurrentView("taxpayers")}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Voir les contribuables</h3>
                      <p className="text-sm text-muted-foreground">Gérer la liste des contribuables</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user.role === "admin" && (
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setCurrentView("staff")}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">🏢</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Gérer le personnel</h3>
                        <p className="text-sm text-muted-foreground">Voir et gérer les employés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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

      case "staff":
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Gestion du personnel
                </h1>
                <p className="text-muted-foreground">
                  Gérer les employés et leur accès au système
                </p>
              </div>
              {user.role === "admin" && (
                <Button
                  onClick={() => setCurrentView("add-employee")}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  Ajouter un employé
                </Button>
              )}
            </div>
            <EmployeesList
              userRole={user.role}
              onEdit={(id) => console.log("Edit employee:", id)}
              onDelete={(id) => console.log("Delete employee:", id)}
              onViewDashboard={(employee) => {
                console.log("View dashboard for:", employee);
                toast({
                  title: "Accès au tableau de bord",
                  description: `Ouverture du dashboard de ${employee.prenom} ${employee.nom}`,
                });
              }}
            />
          </div>
        );

      case "add-employee":
        return (
          <EmployeeForm 
            onSubmit={handleEmployeeSubmit}
            onCancel={() => setCurrentView("staff")}
          />
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
    <DashboardLayout 
      user={user} 
      onLogout={handleLogout}
      activeView={currentView}
      onViewChange={setCurrentView}
    >
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default Index;
