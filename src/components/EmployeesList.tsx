import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Employee {
  id: string;
  nom: string;
  email: string;
  numeroTravail: string | null;
  role: "admin" | "personnel";
  statut: string;
  created_at: string;
}

interface EmployeesListProps {
  userRole: "admin" | "personnel";
  onEdit?: (id: string) => void;
  onRefresh?: () => void;
}

const EmployeesList = ({ userRole, onEdit, onRefresh }: EmployeesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [roleFilter, setRoleFilter] = useState("tous");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      fetchEmployees();
    }
  }, [onRefresh]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          nom,
          email,
          numero_travail,
          organisation_id,
          created_at
        `);

      if (profilesError) throw profilesError;

      if (profiles) {
        const employeesWithRoles = await Promise.all(
          profiles.map(async (profile) => {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.user_id)
              .eq('organisation_id', profile.organisation_id)
              .single();

            return {
              id: profile.id,
              nom: profile.nom,
              email: profile.email || 'N/A',
              numeroTravail: profile.numero_travail,
              role: (roleData?.role as "admin" | "personnel") || 'personnel',
              statut: 'actif',
              created_at: profile.created_at
            };
          })
        );

        setEmployees(employeesWithRoles);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des employés",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.numeroTravail && employee.numeroTravail.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "tous" || employee.statut === statusFilter;
    const matchesRole = roleFilter === "tous" || employee.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-muted-foreground">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>;
      case "inactif":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactif</Badge>;
      case "suspendu":
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge variant="destructive" className="text-xs">Admin</Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">Staff</Badge>
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.text("Liste des Employés", 14, 20);
    
    // Date d'export
    doc.setFontSize(10);
    doc.text(`Export du ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`, 14, 28);
    
    // Statistiques
    const admins = filteredEmployees.filter(e => e.role === 'admin').length;
    const staff = filteredEmployees.filter(e => e.role === 'personnel').length;
    doc.text(`Total: ${filteredEmployees.length} employés (${admins} admins, ${staff} staff)`, 14, 35);
    
    // Préparer les données pour le tableau
    const tableData = filteredEmployees.map(employee => [
      employee.nom,
      employee.email,
      employee.numeroTravail || '-',
      employee.role === 'admin' ? 'Administrateur' : 'Personnel',
      employee.statut === 'actif' ? 'Actif' : employee.statut === 'inactif' ? 'Inactif' : 'Suspendu',
      new Date(employee.created_at).toLocaleDateString("fr-FR")
    ]);
    
    // Générer le tableau
    autoTable(doc, {
      startY: 42,
      head: [['Nom', 'Email', 'N° Travail', 'Rôle', 'Statut', 'Date création']],
      body: tableData,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 45 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
      },
    });
    
    // Sauvegarder le PDF
    doc.save(`employes_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Export réussi",
      description: "La liste des employés a été exportée en PDF",
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>👥</span>
              <span>Gestion des employés</span>
              <Badge variant="outline" className="ml-2">
                {filteredEmployees.length} employé{filteredEmployees.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Exporter en PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="personnel">Personnel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des employés */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>N° Travail</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      Aucun employé trouvé
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {employee.nom.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium text-foreground">
                          {employee.nom}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {employee.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.numeroTravail ? (
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {employee.numeroTravail}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(employee.role)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(employee.statut)}
                    </TableCell>
                    <TableCell>
                      {new Date(employee.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {userRole === "admin" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit?.(employee.id)}
                          >
                            Modifier
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeesList;