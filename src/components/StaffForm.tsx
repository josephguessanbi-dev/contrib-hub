import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StaffFormData {
  nom: string;
  email: string;
  password: string;
  numero_travail: string;
  role: "admin" | "personnel";
}

interface StaffFormProps {
  onSubmit: (data: StaffFormData) => void;
  onCancel: () => void;
  organisationId: string;
}

const StaffForm = ({ onSubmit, onCancel, organisationId }: StaffFormProps) => {
  const [formData, setFormData] = useState<StaffFormData>({
    nom: "",
    email: "",
    password: "",
    numero_travail: "",
    role: "personnel"
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            nom: formData.nom,
            numero_travail: formData.numero_travail,
            organisation_id: organisationId,
            role: formData.role
          }
        }
      });

      if (authError) {
        toast({
          title: "Erreur",
          description: authError.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Si l'utilisateur est créé avec succès
      if (authData.user) {
        // Attendre un peu pour que le trigger s'exécute
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Vérifier si le profil existe déjà (créé par le trigger)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        if (!existingProfile) {
          // Créer le profil manuellement si le trigger n'a pas fonctionné
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: authData.user.id,
              nom: formData.nom,
              numero_travail: formData.numero_travail,
              organisation_id: organisationId
            });

          if (profileError) {
            console.error("Erreur profil:", profileError);
            throw profileError;
          }
        }

        // Vérifier si le rôle existe déjà (créé par le trigger)
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        if (!existingRole) {
          // Créer le rôle manuellement si le trigger n'a pas fonctionné
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: formData.role,
              organisation_id: organisationId
            });

          if (roleError) {
            console.error("Erreur rôle:", roleError);
            throw roleError;
          }
        } else {
          // Mettre à jour le rôle si nécessaire
          const { error: roleUpdateError } = await supabase
            .from('user_roles')
            .update({ role: formData.role })
            .eq('user_id', authData.user.id)
            .eq('organisation_id', organisationId);

          if (roleUpdateError) {
            console.error("Erreur mise à jour rôle:", roleUpdateError);
          }
        }

        toast({
          title: "Agent ajouté",
          description: "L'agent peut maintenant se connecter avec son email et mot de passe."
        });

        onSubmit(formData);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'agent",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof StaffFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">
          Ajouter un Agent du Staff
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom complet *</Label>
            <Input
              id="nom"
              type="text"
              placeholder="Ex: Jean Dupont"
              value={formData.nom}
              onChange={(e) => handleInputChange("nom", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ex: jean.dupont@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe temporaire *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 caractères"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_travail">Numéro de travail</Label>
            <Input
              id="numero_travail"
              type="text"
              placeholder="Ex: EMP001"
              value={formData.numero_travail}
              onChange={(e) => handleInputChange("numero_travail", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle *</Label>
            <Select value={formData.role} onValueChange={(value: "admin" | "personnel") => handleInputChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personnel">Personnel</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Création..." : "Créer l'agent"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StaffForm;