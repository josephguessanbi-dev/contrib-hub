import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Employee {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroTravail: string;
  role: "admin" | "personnel";
  departement: string;
  statut: string;
  dateEmbauche: string;
  dateCreation: string;
}

interface EmployeesListProps {
  userRole: "admin" | "personnel";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewDashboard?: (employee: Employee) => void;
}

const EmployeesList = ({ userRole, onEdit, onDelete, onViewDashboard }: EmployeesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [roleFilter, setRoleFilter] = useState("tous");

  // Données simulées - à remplacer par des données réelles
  const [employees] = useState<Employee[]>([
    {
      id: "1",
      nom: "Dubois",
      prenom: "Jean",
      email: "jean.dubois@taxcontrib.com",
      telephone: "+33 1 23 45 67 89",
      numeroTravail: "EMP001",
      role: "admin",
      departement: "Direction",
      statut: "actif",
      dateEmbauche: "2023-01-15",
      dateCreation: new Date().toISOString(),
    },
    {
      id: "2",
      nom: "Martin",
      prenom: "Sophie",
      email: "sophie.martin@taxcontrib.com",
      telephone: "+33 1 23 45 67 90",
      numeroTravail: "EMP002",
      role: "personnel",
      departement: "Contributions",
      statut: "actif",
      dateEmbauche: "2023-03-10",
      dateCreation: new Date().toISOString(),
    },
    {
      id: "3",
      nom: "Leroy",
      prenom: "Pierre",
      email: "pierre.leroy@taxcontrib.com",
      telephone: "+33 1 23 45 67 91",
      numeroTravail: "EMP003",
      role: "personnel",
      departement: "Contrôle",
      statut: "inactif",
      dateEmbauche: "2022-11-20",
      dateCreation: new Date().toISOString(),
    },
  ]);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.numeroTravail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "tous" || employee.statut === statusFilter;
    const matchesRole = roleFilter === "tous" || employee.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

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
                <TableHead>Employé</TableHead>
                <TableHead>N° Travail</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date embauche</TableHead>
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
                            {employee.prenom.charAt(0)}{employee.nom.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {employee.prenom} {employee.nom}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {employee.numeroTravail}
                      </code>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(employee.role)}
                    </TableCell>
                    <TableCell>{employee.departement || "-"}</TableCell>
                    <TableCell>
                      {getStatusBadge(employee.statut)}
                    </TableCell>
                    <TableCell>
                      {employee.dateEmbauche ? 
                        new Date(employee.dateEmbauche).toLocaleDateString('fr-FR') : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDashboard?.(employee)}
                        >
                          Dashboard
                        </Button>
                        {userRole === "admin" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit?.(employee.id)}
                            >
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onDelete?.(employee.id)}
                            >
                              Supprimer
                            </Button>
                          </>
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