import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const staffSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string().trim().email("Email invalide").max(255, "L'email ne peut pas dépasser 255 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(100),
  numeroTravail: z.string().trim().min(1, "Le numéro de travail est requis").max(50, "Le numéro ne peut pas dépasser 50 caractères"),
  role: z.enum(["admin", "personnel"], { required_error: "Veuillez sélectionner un rôle" })
});

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      nom: "",
      email: "",
      password: "",
      numeroTravail: "",
      role: "personnel"
    }
  });

  const handleFormSubmit = async (values: z.infer<typeof staffSchema>) => {
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nom: values.nom,
            numero_travail: values.numeroTravail,
            organisation_id: organisationId,
            role: values.role
          }
        }
      });

      if (authError) {
        toast({
          title: "Erreur",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            nom: values.nom,
            numero_travail: values.numeroTravail,
            organisation_id: organisationId
          });

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: values.role,
            organisation_id: organisationId
          });

        if (profileError || roleError) {
          console.warn("Erreur lors de la création du profil/rôle:", { profileError, roleError });
        }

        toast({
          title: "Agent ajouté",
          description: "L'agent du staff a été créé avec succès."
        });

        onSubmit({ 
          nom: values.nom,
          email: values.email,
          password: values.password,
          numero_travail: values.numeroTravail,
          role: values.role
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'agent",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">
          Ajouter un Agent du Staff
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jean Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Minimum 8 caractères" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numeroTravail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de travail *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: EMP001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="personnel">Personnel</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </CardContent>
    </Card>
  );
};

export default StaffForm;