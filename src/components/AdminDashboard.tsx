import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import EmployeeForm from "./EmployeeForm";

interface Employee {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroTravail: string;
  dateEmbauche: string;
  status: "actif" | "suspendu" | "inactif";
}

interface AdminDashboardProps {
  admin: {
    id: string;
    name: string;
  };
  onLogout: () => void;
}

const AdminDashboard = ({ admin, onLogout }: AdminDashboardProps) => {
  const [activeView, setActiveView] = useState<"overview" | "employees" | "add-employee">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock data pour les employés
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      nom: "Dubois",
      prenom: "Marie",
      email: "marie.dubois@example.com",
      telephone: "0123456789",
      numeroTravail: "EMP001",
      dateEmbauche: "2023-01-15",
      status: "actif"
    },
    {
      id: "2",
      nom: "Martin",
      prenom: "Jean",
      email: "jean.martin@example.com",
      telephone: "0123456790",
      numeroTravail: "EMP002",
      dateEmbauche: "2023-02-10",
      status: "actif"
    },
    {
      id: "3",
      nom: "Bernard",
      prenom: "Sophie",
      email: "sophie.bernard@example.com",
      telephone: "0123456791",
      numeroTravail: "EMP003",
      dateEmbauche: "2023-03-05",
      status: "suspendu"
    }
  ]);

  const handleSuspendEmployee = (id: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, status: "suspendu" as const } : emp
    ));
    toast({
      title: "Employé suspendu",
      description: "L'employé a été suspendu avec succès",
      variant: "destructive"
    });
  };

  const handleActivateEmployee = (id: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, status: "actif" as const } : emp
    ));
    toast({
      title: "Employé activé",
      description: "L'employé a été réactivé avec succès"
    });
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    toast({
      title: "Employé supprimé",
      description: "L'employé a été supprimé définitivement",
      variant: "destructive"
    });
  };

  const handleAddEmployee = (data: any) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...data,
      status: "actif" as const
    };
    setEmployees(prev => [...prev, newEmployee]);
    toast({
      title: "Employé ajouté",
      description: "Nouvel employé enregistré avec succès"
    });
    setActiveView("employees");
  };

  const filteredEmployees = employees.filter(emp =>
    emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.numeroTravail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeEmployees = employees.filter(emp => emp.status === "actif").length;
  const suspendedEmployees = employees.filter(emp => emp.status === "suspendu").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2 hover:bg-primary/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold">TC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TaxContrib Admin</h1>
              <p className="text-sm text-muted-foreground">Tableau de bord administrateur</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {admin.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{admin.name}</p>
                <Badge variant="destructive" className="text-xs">Administrateur</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
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
              variant={activeView === "employees" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("employees")}
            >
              👥 Employés
            </Button>
            <Button
              variant={activeView === "add-employee" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("add-employee")}
            >
              ➕ Ajouter Employé
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeView === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Vue d'ensemble</h2>
              <p className="text-muted-foreground">Statistiques et informations générales</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Employés Actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">{activeEmployees}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Employés Suspendus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">{suspendedEmployees}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Employés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{employees.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" 
                    onClick={() => setActiveView("add-employee")}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-xl flex items-center justify-center">
                      <span className="text-success-foreground text-2xl">➕</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Ajouter un employé</h3>
                      <p className="text-sm text-muted-foreground">Enregistrer un nouvel employé</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" 
                    onClick={() => setActiveView("employees")}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                      <span className="text-primary-foreground text-2xl">👥</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Gérer les employés</h3>
                      <p className="text-sm text-muted-foreground">Voir et modifier les employés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === "employees" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Gestion des Employés</h2>
                <p className="text-muted-foreground">Gérer, suspendre ou supprimer les employés</p>
              </div>
              <Button onClick={() => setActiveView("add-employee")} className="bg-gradient-to-r from-primary to-primary/90">
                ➕ Ajouter un employé
              </Button>
            </div>

            {/* Search */}
            <div className="max-w-md">
              <Input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Employees List */}
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {employee.prenom.charAt(0)}{employee.nom.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {employee.prenom} {employee.nom}
                          </h3>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant={employee.status === "actif" ? "default" : 
                                      employee.status === "suspendu" ? "destructive" : "secondary"}
                            >
                              {employee.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">#{employee.numeroTravail}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {employee.status === "actif" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendEmployee(employee.id)}
                            className="text-warning border-warning hover:bg-warning hover:text-warning-foreground"
                          >
                            Suspendre
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateEmployee(employee.id)}
                            className="text-success border-success hover:bg-success hover:text-success-foreground"
                          >
                            Activer
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === "add-employee" && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Ajouter un Employé</h2>
              <p className="text-muted-foreground">Enregistrer un nouvel employé dans le système</p>
            </div>
            <EmployeeForm 
              onSubmit={handleAddEmployee}
              onCancel={() => setActiveView("employees")}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;