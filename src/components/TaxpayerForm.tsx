import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaxpayerFormProps {
  onSubmit: (data: any) => void;
  isPublic?: boolean;
}

const TaxpayerForm = ({ onSubmit, isPublic = false }: TaxpayerFormProps) => {
  const [formData, setFormData] = useState({
    raisonSociale: "",
    ville: "",
    commune: "",
    quartier: "",
    gerantNom: "",
    gerantPrenom: "",
    rccm: "",
    ncc: "",
    contact1: "",
    contact2: "",
    latitude: "",
    longitude: "",
    commentaire: "",
    documents: [] as File[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      createdAt: new Date().toISOString(),
      status: "en_attente",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        documents: [...formData.documents, ...Array.from(e.target.files)],
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isPublic ? "Enregistrement Contribuable" : "Nouveau Contribuable"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Veuillez remplir tous les champs obligatoires pour enregistrer un contribuable
        </p>
        {isPublic && (
          <Badge variant="secondary" className="mt-4">
            Formulaire public - Validation requise
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                <Label htmlFor="raisonSociale">Raison sociale *</Label>
                <Input
                  id="raisonSociale"
                  value={formData.raisonSociale}
                  onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville">Ville *</Label>
                <Input
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commune">Commune *</Label>
                <Input
                  id="commune"
                  value={formData.commune}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quartier">Quartier *</Label>
                <Input
                  id="quartier"
                  value={formData.quartier}
                  onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                  required
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
                <Label htmlFor="gerantNom">Nom du gérant *</Label>
                <Input
                  id="gerantNom"
                  value={formData.gerantNom}
                  onChange={(e) => setFormData({ ...formData, gerantNom: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gerantPrenom">Prénom du gérant *</Label>
                <Input
                  id="gerantPrenom"
                  value={formData.gerantPrenom}
                  onChange={(e) => setFormData({ ...formData, gerantPrenom: e.target.value })}
                  required
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
                <Label htmlFor="rccm">RCCM *</Label>
                <Input
                  id="rccm"
                  value={formData.rccm}
                  onChange={(e) => setFormData({ ...formData, rccm: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ncc">NCC *</Label>
                <Input
                  id="ncc"
                  value={formData.ncc}
                  onChange={(e) => setFormData({ ...formData, ncc: e.target.value })}
                  required
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
                <Label htmlFor="contact1">Contact 1 *</Label>
                <Input
                  id="contact1"
                  type="tel"
                  value={formData.contact1}
                  onChange={(e) => setFormData({ ...formData, contact1: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact2">Contact 2</Label>
                <Input
                  id="contact2"
                  type="tel"
                  value={formData.contact2}
                  onChange={(e) => setFormData({ ...formData, contact2: e.target.value })}
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
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="Ex: -4.325"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="Ex: 15.315"
                />
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center text-muted-foreground">
              📱 Cliquez sur la carte pour définir la position géographique
              <br />
              <small>(Fonctionnalité carte sera intégrée avec la géolocalisation)</small>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📄</span>
              <span>Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documents">Documents (Registre de commerce, DFE, Pièce d'identité)</Label>
              <Input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
              />
              {formData.documents.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {formData.documents.length} document(s) sélectionné(s)
                </div>
              )}
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
              <Label htmlFor="commentaire">Commentaires ou remarques</Label>
              <Textarea
                id="commentaire"
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                rows={4}
                placeholder="Informations supplémentaires..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Annuler
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-8"
          >
            {isPublic ? "Soumettre la demande" : "Enregistrer le contribuable"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaxpayerForm;