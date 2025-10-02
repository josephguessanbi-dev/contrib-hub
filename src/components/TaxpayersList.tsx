import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TaxpayerDetail from "./TaxpayerDetail";

interface Taxpayer {
  id: string;
  raison_sociale: string;
  ville: string;
  nom_gerant: string;
  prenom_gerant: string;
  contact_1: string;
  statut: "en_attente" | "valide" | "rejete";
  created_at: string;
  rccm: string | null;
  ncc: string | null;
  commune: string;
  quartier: string | null;
  contact_2: string | null;
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
  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaxpayerId, setSelectedTaxpayerId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTaxpayers = async () => {
      try {
        const { data, error } = await supabase
          .from('contribuables')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les contribuables",
            variant: "destructive"
          });
        } else {
          setTaxpayers(data || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des contribuables:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxpayers();
  }, [toast]);

  const handleValidate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contribuables')
        .update({ statut: 'valide' })
        .eq('id', id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de valider le contribuable",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Validé",
          description: "Le contribuable a été validé"
        });
        // Refresh data
        setTaxpayers(prev => prev.map(t => t.id === id ? { ...t, statut: 'valide' } : t));
        onValidate?.(id);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contribuables')
        .update({ statut: 'rejete' })
        .eq('id', id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de rejeter le contribuable",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Rejeté",
          description: "Le contribuable a été rejeté",
          variant: "destructive"
        });
        // Refresh data
        setTaxpayers(prev => prev.map(t => t.id === id ? { ...t, statut: 'rejete' } : t));
        onReject?.(id);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contribuable ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contribuables')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le contribuable",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Supprimé",
          description: "Le contribuable a été supprimé"
        });
        // Refresh data
        setTaxpayers(prev => prev.filter(t => t.id !== id));
        onDelete?.(id);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

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

  const filteredTaxpayers = taxpayers.filter(taxpayer => {
    const matchesSearch = taxpayer.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxpayer.nom_gerant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxpayer.ville.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || taxpayer.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
                  <CardTitle className="text-lg">{taxpayer.raison_sociale}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gérant: {taxpayer.prenom_gerant} {taxpayer.nom_gerant}
                  </p>
                </div>
                {getStatusBadge(taxpayer.statut)}
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
                  <p className="font-medium">{taxpayer.contact_1}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RCCM</p>
                  <p className="font-medium">{taxpayer.rccm || 'Non renseigné'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Enregistré le {new Date(taxpayer.created_at).toLocaleDateString("fr-FR")}
                </div>
                
                <div className="flex gap-2">
                  {userRole === "admin" && taxpayer.statut === "en_attente" && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-success text-success-foreground hover:bg-success/90"
                        onClick={() => handleValidate(taxpayer.id)}
                      >
                        Valider
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(taxpayer.id)}
                      >
                        Rejeter
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedTaxpayerId(taxpayer.id)}
                  >
                    Voir détails
                  </Button>
                  
                  {userRole === "admin" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(taxpayer.id)}
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

      {selectedTaxpayerId && (
        <TaxpayerDetail
          taxpayerId={selectedTaxpayerId}
          isOpen={!!selectedTaxpayerId}
          onClose={() => setSelectedTaxpayerId(null)}
          onUpdate={() => {
            // Refresh the list
            const fetchTaxpayers = async () => {
              const { data } = await supabase
                .from('contribuables')
                .select('*')
                .order('created_at', { ascending: false });
              if (data) setTaxpayers(data);
            };
            fetchTaxpayers();
          }}
        />
      )}
    </div>
  );
};

export default TaxpayersList;