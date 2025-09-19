import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/AuthLayout";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

const Index = () => {
  const [admin, setAdmin] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { toast } = useToast();

  const handleAdminLogin = (adminId: string) => {
    // Simulation de connexion admin
    setAdmin({
      id: adminId,
      name: "Administrateur Système"
    });
    toast({
      title: "Connexion réussie",
      description: "Bienvenue Administrateur",
    });
  };

  const handleLogout = () => {
    setAdmin(null);
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  // Si pas connecté, afficher la page de connexion admin
  if (!admin) {
    return (
      <AuthLayout
        title="TaxContrib"
        subtitle="Plateforme d'administration"
      >
        <AdminLogin onLogin={handleAdminLogin} />
      </AuthLayout>
    );
  }

  return <AdminDashboard admin={admin} onLogout={handleLogout} />;
};

export default Index;
