import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const employeeSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  prenom: z.string().trim().min(1, "Le prénom est requis").max(100, "Le prénom ne peut pas dépasser 100 caractères"),
  email: z.string().trim().email("Email invalide").max(255, "L'email ne peut pas dépasser 255 caractères"),
  telephone: z.string().trim().regex(/^[0-9+\-\s()]+$/, "Numéro de téléphone invalide").min(8, "Le numéro doit contenir au moins 8 chiffres").max(20, "Le numéro ne peut pas dépasser 20 caractères").optional().or(z.literal("")),
  numeroTravail: z.string().trim().min(1, "Le numéro de travail est requis").max(50, "Le numéro ne peut pas dépasser 50 caractères"),
  role: z.enum(["admin", "personnel"], { required_error: "Veuillez sélectionner un rôle" }),
  departement: z.string().trim().max(100, "Le département ne peut pas dépasser 100 caractères").optional().or(z.literal("")),
  adresse: z.string().trim().max(500, "L'adresse ne peut pas dépasser 500 caractères").optional().or(z.literal("")),
  dateEmbauche: z.string().optional().or(z.literal("")),
  salaire: z.string().trim().regex(/^[0-9]+(\.[0-9]{1,2})?$/, "Salaire invalide").optional().or(z.literal("")),
  statut: z.enum(["actif", "inactif", "suspendu"], { required_error: "Veuillez sélectionner un statut" }),
  commentaires: z.string().trim().max(1000, "Les commentaires ne peuvent pas dépasser 1000 caractères").optional().or(z.literal(""))
});

interface EmployeeFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const EmployeeForm = ({ onSubmit, onCancel }: EmployeeFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
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
    }
  });

  const handleFormSubmit = (values: z.infer<typeof employeeSchema>) => {
    const submissionData = {
      ...values,
      id: Date.now().toString(),
      dateCreation: new Date().toISOString(),
      createdBy: "current-user-id"
    };

    onSubmit?.(submissionData);
    
    toast({
      title: "Employé enregistré",
      description: "L'employé a été ajouté avec succès au système",
    });

    form.reset();
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de famille" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemple.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+33 1 23 45 67 89" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="adresse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Adresse complète" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                <FormField
                  control={form.control}
                  name="numeroTravail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de travail *</FormLabel>
                      <FormControl>
                        <Input placeholder="EMP001" {...field} />
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
                            <SelectValue placeholder="Sélectionnez un rôle" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Département</FormLabel>
                      <FormControl>
                        <Input placeholder="Ressources Humaines" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateEmbauche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'embauche</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salaire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salaire mensuel</FormLabel>
                      <FormControl>
                        <Input placeholder="50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="statut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="actif">Actif</SelectItem>
                          <SelectItem value="inactif">Inactif</SelectItem>
                          <SelectItem value="suspendu">Suspendu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <FormField
                control={form.control}
                name="commentaires"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarques additionnelles</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informations supplémentaires sur l'employé..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
      </Form>
    </div>
  );
};

export default EmployeeForm;
