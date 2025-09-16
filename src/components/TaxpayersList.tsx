import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Taxpayer {
  id: string;
  raisonSociale: string;
  ville: string;
  gerantNom: string;
  gerantPrenom: string;
  contact1: string;
  status: "en_attente" | "valide" | "rejete";
  createdAt: string;
  rccm: string;
  ncc: string;
}

interface TaxpayersListProps {
  userRole: "admin" | "personnel";
  onValidate?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TaxpayersList = ({ userRole, onValidate, onReject, onEdit, onDelete }: TaxpayersListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Données mockées pour la démo
  const mockTaxpayers: Taxpayer[] = [
    {
      id: "1",
      raisonSociale: "SARL TECH SOLUTIONS",
      ville: "Brazzaville",
      gerantNom: "MBEMBA",
      gerantPrenom: "Jean",
      contact1: "+242 06 123 4567",
      status: "en_attente",
      createdAt: "2024-01-15T10:30:00Z",
      rccm: "CG-BZV-01-B-12345",
      ncc: "M123456789"
    },
    {
      id: "2",
      raisonSociale: "ENTREPRISE MOKOKO",
      ville: "Pointe-Noire",
      gerantNom: "MATONDO",
      gerantPrenom: "Marie",
      contact1: "+242 06 987 6543",
      status: "valide",
      createdAt: "2024-01-10T14:20:00Z",
      rccm: "CG-PNR-01-B-67890",
      ncc: "M987654321"
    },
    {
      id: "3",
      raisonSociale: "COMMERCE GENERAL NKOUKOU",
      ville: "Dolisie",
      gerantNom: "NKOUKOU",
      gerantPrenom: "Paul",
      contact1: "+242 06 555 1234",
      status: "rejete",
      createdAt: "2024-01-05T09:15:00Z",
      rccm: "CG-DOL-01-B-11111",
      ncc: "M111222333"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_attente":
        return <Badge variant="secondary">En attente</Badge>;
      case "valide":
        return <Badge className="bg-success text-success-foreground">Validé</Badge>;
      case "rejete":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTaxpayers = mockTaxpayers.filter(taxpayer => {
    const matchesSearch = taxpayer.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxpayer.gerantNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxpayer.ville.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || taxpayer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom, gérant ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="valide">Validé</SelectItem>
            <SelectItem value="rejete">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredTaxpayers.map((taxpayer) => (
          <Card key={taxpayer.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{taxpayer.raisonSociale}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gérant: {taxpayer.gerantPrenom} {taxpayer.gerantNom}
                  </p>
                </div>
                {getStatusBadge(taxpayer.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Ville</p>
                  <p className="font-medium">{taxpayer.ville}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-medium">{taxpayer.contact1}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RCCM</p>
                  <p className="font-medium">{taxpayer.rccm}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Enregistré le {new Date(taxpayer.createdAt).toLocaleDateString("fr-FR")}
                </div>
                
                <div className="flex gap-2">
                  {userRole === "admin" && taxpayer.status === "en_attente" && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-success text-success-foreground hover:bg-success/90"
                        onClick={() => onValidate?.(taxpayer.id)}
                      >
                        Valider
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => onReject?.(taxpayer.id)}
                      >
                        Rejeter
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEdit?.(taxpayer.id)}
                  >
                    Modifier
                  </Button>
                  
                  {userRole === "admin" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onDelete?.(taxpayer.id)}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTaxpayers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">Aucun contribuable trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaxpayersList;