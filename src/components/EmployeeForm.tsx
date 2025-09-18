import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const EmployeeForm = ({ onSubmit, onCancel }: EmployeeFormProps) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    numeroTravail: "",
    role: "personnel" as "admin" | "personnel",
    departement: "",
    adresse: "",
    dateEmbauche: "",
    salaire: "",
    statut: "actif",
    commentaires: "",
  });

  const { toast } = useToast();

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.nom || !formData.prenom || !formData.email || !formData.numeroTravail) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      ...formData,
      id: Date.now().toString(), // ID temporaire pour la simulation
      dateCreation: new Date().toISOString(),
      createdBy: "current-user-id" // À remplacer par l'ID de l'utilisateur connecté
    };

    console.log("Nouvelle soumission employé:", submissionData);
    
    onSubmit?.(submissionData);
    
    toast({
      title: "Employé enregistré",
      description: "L'employé a été ajouté avec succès au système",
    });

    // Reset du formulaire
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      numeroTravail: "",
      role: "personnel",
      departement: "",
      adresse: "",
      dateEmbauche: "",
      salaire: "",
      statut: "actif",
      commentaires: "",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Nouveau employé
        </h1>
        <p className="text-muted-foreground">
          Enregistrer un nouvel employé dans le système
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>👤</span>
              <span>Informations personnelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-medium">
                  Nom *
                </Label>
                <Input
                  id="nom"
                  type="text"
                  placeholder="Nom de famille"
                  value={formData.nom}
                  onChange={(e) => handleChange("nom", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-sm font-medium">
                  Prénom *
                </Label>
                <Input
                  id="prenom"
                  type="text"
                  placeholder="Prénom"
                  value={formData.prenom}
                  onChange={(e) => handleChange("prenom", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-sm font-medium">
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+33 1 23 45 67 89"
                  value={formData.telephone}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse" className="text-sm font-medium">
                Adresse
              </Label>
              <Input
                id="adresse"
                type="text"
                placeholder="Adresse complète"
                value={formData.adresse}
                onChange={(e) => handleChange("adresse", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>💼</span>
              <span>Informations professionnelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numeroTravail" className="text-sm font-medium">
                  Numéro de travail *
                </Label>
                <Input
                  id="numeroTravail"
                  type="text"
                  placeholder="EMP001"
                  value={formData.numeroTravail}
                  onChange={(e) => handleChange("numeroTravail", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Rôle *
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personnel">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">Staff</Badge>
                        <span>Personnel</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="text-xs">Admin</Badge>
                        <span>Administrateur</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departement" className="text-sm font-medium">
                  Département
                </Label>
                <Input
                  id="departement"
                  type="text"
                  placeholder="Ressources Humaines"
                  value={formData.departement}
                  onChange={(e) => handleChange("departement", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEmbauche" className="text-sm font-medium">
                  Date d'embauche
                </Label>
                <Input
                  id="dateEmbauche"
                  type="date"
                  value={formData.dateEmbauche}
                  onChange={(e) => handleChange("dateEmbauche", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaire" className="text-sm font-medium">
                  Salaire mensuel
                </Label>
                <Input
                  id="salaire"
                  type="number"
                  placeholder="50000"
                  value={formData.salaire}
                  onChange={(e) => handleChange("salaire", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut" className="text-sm font-medium">
                  Statut
                </Label>
                <Select value={formData.statut} onValueChange={(value) => handleChange("statut", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="suspendu">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commentaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📝</span>
              <span>Commentaires</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="commentaires" className="text-sm font-medium">
                Remarques additionnelles
              </Label>
              <Textarea
                id="commentaires"
                placeholder="Informations supplémentaires sur l'employé..."
                value={formData.commentaires}
                onChange={(e) => handleChange("commentaires", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            Enregistrer l'employé
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;