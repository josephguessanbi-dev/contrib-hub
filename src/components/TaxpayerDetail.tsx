import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaxpayerDetailProps {
  taxpayerId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const TaxpayerDetail = ({ taxpayerId, isOpen, onClose, onUpdate }: TaxpayerDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    raison_sociale: "",
    ville: "",
    commune: "",
    quartier: "",
    nom_gerant: "",
    prenom_gerant: "",
    rccm: "",
    ncc: "",
    contact_1: "",
    contact_2: "",
    latitude: "",
    longitude: "",
    commentaire: "",
    statut: "en_attente" as "en_attente" | "valide" | "rejete",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && taxpayerId) {
      fetchTaxpayerDetails();
    }
  }, [isOpen, taxpayerId]);

  const fetchTaxpayerDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contribuables')
        .select('*')
        .eq('id', taxpayerId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          raison_sociale: data.raison_sociale || "",
          ville: data.ville || "",
          commune: data.commune || "",
          quartier: data.quartier || "",
          nom_gerant: data.nom_gerant || "",
          prenom_gerant: data.prenom_gerant || "",
          rccm: data.rccm || "",
          ncc: data.ncc || "",
          contact_1: data.contact_1 || "",
          contact_2: data.contact_2 || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          commentaire: data.commentaire || "",
          statut: data.statut,
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du contribuable",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('contribuables')
        .update({
          raison_sociale: formData.raison_sociale,
          ville: formData.ville,
          commune: formData.commune,
          quartier: formData.quartier || null,
          nom_gerant: formData.nom_gerant,
          prenom_gerant: formData.prenom_gerant,
          rccm: formData.rccm || null,
          ncc: formData.ncc || null,
          contact_1: formData.contact_1,
          contact_2: formData.contact_2 || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          commentaire: formData.commentaire || null,
        })
        .eq('id', taxpayerId);

      if (error) throw error;

      toast({
        title: "Enregistré",
        description: "Les modifications ont été enregistrées avec succès"
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = () => {
    switch (formData.statut) {
      case "en_attente":
        return <Badge variant="secondary">En attente</Badge>;
      case "valide":
        return <Badge className="bg-success text-success-foreground">Validé</Badge>;
      case "rejete":
        return <Badge variant="destructive">Rejeté</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Détails du Contribuable</DialogTitle>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de l'entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🏢</span>
                <span>Informations de l'entreprise</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Raison sociale</Label>
                  <Input
                    value={formData.raison_sociale}
                    onChange={(e) => setFormData({ ...formData, raison_sociale: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commune</Label>
                  <Input
                    value={formData.commune}
                    onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quartier</Label>
                  <Input
                    value={formData.quartier}
                    onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations du gérant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>👤</span>
                <span>Informations du gérant</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du gérant</Label>
                  <Input
                    value={formData.nom_gerant}
                    onChange={(e) => setFormData({ ...formData, nom_gerant: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prénom du gérant</Label>
                  <Input
                    value={formData.prenom_gerant}
                    onChange={(e) => setFormData({ ...formData, prenom_gerant: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations légales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📋</span>
                <span>Informations légales</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RCCM</Label>
                  <Input
                    value={formData.rccm}
                    onChange={(e) => setFormData({ ...formData, rccm: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>NCC</Label>
                  <Input
                    value={formData.ncc}
                    onChange={(e) => setFormData({ ...formData, ncc: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📞</span>
                <span>Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact 1</Label>
                  <Input
                    value={formData.contact_1}
                    onChange={(e) => setFormData({ ...formData, contact_1: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact 2</Label>
                  <Input
                    value={formData.contact_2}
                    onChange={(e) => setFormData({ ...formData, contact_2: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Géolocalisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📍</span>
                <span>Géolocalisation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commentaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💬</span>
                <span>Commentaires</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Commentaires ou remarques</Label>
                <Textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                fetchTaxpayerDetails();
              }}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                Enregistrer
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaxpayerDetail;
