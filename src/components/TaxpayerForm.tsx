import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import MapPicker from "@/components/MapPicker";

// Validation schema
const taxpayerSchema = z.object({
  raisonSociale: z.string().trim().min(1, "La raison sociale est requise").max(200, "Maximum 200 caractères"),
  ville: z.string().trim().min(1, "La ville est requise").max(100, "Maximum 100 caractères"),
  commune: z.string().trim().min(1, "La commune est requise").max(100, "Maximum 100 caractères"),
  quartier: z.string().trim().min(1, "Le quartier est requis").max(100, "Maximum 100 caractères"),
  gerantNom: z.string().trim().min(1, "Le nom du gérant est requis").max(100, "Maximum 100 caractères"),
  gerantPrenom: z.string().trim().min(1, "Le prénom du gérant est requis").max(100, "Maximum 100 caractères"),
  rccm: z.string().trim().min(1, "Le RCCM est requis").max(50, "Maximum 50 caractères"),
  ncc: z.string().trim().min(1, "Le NCC est requis").max(50, "Maximum 50 caractères"),
  contact1: z.string().trim().regex(/^[0-9+\-\s()]+$/, "Format de téléphone invalide").min(8, "Minimum 8 caractères").max(20, "Maximum 20 caractères"),
  contact2: z.string().trim().regex(/^[0-9+\-\s()]*$/, "Format de téléphone invalide").max(20, "Maximum 20 caractères").optional(),
  latitude: z.string().optional().refine(
    (val) => !val || (val !== "" && !isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90),
    "Latitude doit être entre -90 et 90"
  ),
  longitude: z.string().optional().refine(
    (val) => !val || (val !== "" && !isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180),
    "Longitude doit être entre -180 et 180"
  ),
  commentaire: z.string().trim().max(2000, "Maximum 2000 caractères").optional(),
  documents: z.array(z.instanceof(File)).optional()
});

interface TaxpayerFormProps {
  onSubmit: (data: any) => void;
  isPublic?: boolean;
}

const TaxpayerForm = ({ onSubmit, isPublic = false }: TaxpayerFormProps) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<File[]>([]);
  
  const form = useForm<z.infer<typeof taxpayerSchema>>({
    resolver: zodResolver(taxpayerSchema),
    defaultValues: {
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
      documents: []
    },
  });

  const handleFormSubmit = (data: z.infer<typeof taxpayerSchema>) => {
    // Validate file uploads
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    for (const file of documents) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Erreur",
          description: `Le fichier ${file.name} dépasse la taille maximale de 10MB`,
          variant: "destructive"
        });
        return;
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Erreur",
          description: `Le fichier ${file.name} n'est pas un type autorisé (PDF, JPG, PNG, GIF, WEBP)`,
          variant: "destructive"
        });
        return;
      }
    }
    
    // Map form data to database column names
    const mappedData = {
      raison_sociale: data.raisonSociale,
      ville: data.ville,
      commune: data.commune,
      quartier: data.quartier,
      nom_gerant: data.gerantNom,
      prenom_gerant: data.gerantPrenom,
      rccm: data.rccm,
      ncc: data.ncc,
      contact_1: data.contact1,
      contact_2: data.contact2 || null,
      latitude: data.latitude && data.latitude !== "" ? parseFloat(data.latitude) : null,
      longitude: data.longitude && data.longitude !== "" ? parseFloat(data.longitude) : null,
      commentaire: data.commentaire || null,
      statut: "en_attente",
      documents: documents,
    };
    
    onSubmit(mappedData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = [...documents, ...Array.from(e.target.files)];
      setDocuments(newDocs);
      form.setValue('documents', newDocs);
    }
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    setDocuments(newDocuments);
    form.setValue('documents', newDocuments);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 py-10">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl mb-4 shadow-lg">
          <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">
          {isPublic ? "Enregistrement Contribuable" : "Nouveau Contribuable"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Veuillez remplir tous les champs obligatoires pour enregistrer un contribuable
        </p>
        {isPublic && (
          <Badge variant="secondary" className="mt-4 px-4 py-2 text-sm">
            📋 Formulaire public - Validation requise
          </Badge>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Informations de l'entreprise */}
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <span className="text-xl">Informations de l'entreprise</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="raisonSociale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison sociale *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ville"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commune"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commune *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quartier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quartier *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations du gérant */}
        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-secondary/20 to-transparent">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <span className="text-xl">Informations du gérant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gerantNom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du gérant *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gerantPrenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom du gérant *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations légales */}
        <Card className="border-l-4 border-l-accent shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-accent/30 to-transparent">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/40 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <span className="text-xl">Informations légales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rccm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RCCM *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ncc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NCC *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card className="border-l-4 border-l-success shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-success/10 to-transparent">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📞</span>
              </div>
              <span className="text-xl">Contacts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact 1 *</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+243 XXX XXX XXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact 2</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+243 XXX XXX XXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Géolocalisation */}
        <Card className="border-l-4 border-l-warning shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-warning/10 to-transparent">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <span className="text-xl">Géolocalisation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MapPicker
              latitude={form.watch("latitude")}
              longitude={form.watch("longitude")}
              onLocationChange={(lat, lng) => {
                form.setValue("latitude", lat.toString());
                form.setValue("longitude", lng.toString());
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Ex: -4.325" readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Ex: 15.315" readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <span className="text-xl">Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documents">Documents (PDF ou Images: JPG, PNG, GIF, WEBP)</Label>
              <Input
                id="documents"
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Formats acceptés: PDF, JPG, JPEG, PNG, GIF, WEBP (max 10MB par fichier)
              </p>
              {documents.length > 0 && (
                 <div className="mt-3 space-y-2">
                   <p className="text-sm font-medium text-foreground">
                     {documents.length} document(s) sélectionné(s):
                   </p>
                   <div className="space-y-2">
                     {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm text-foreground truncate flex-1">{doc.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            removeDocument(index);
                          }}
                          className="text-destructive hover:text-destructive ml-2"
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Commentaires */}
        <Card className="border-l-4 border-l-muted shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <span className="text-xl">Commentaires</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="commentaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentaires ou remarques</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Informations supplémentaires..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            className="px-8 hover:bg-muted"
            onClick={() => {
              form.reset();
              if (isPublic) {
                window.location.href = "/";
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-10 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isPublic ? "Soumettre la demande" : "Enregistrer le contribuable"}
          </Button>
        </div>
        </form>
      </Form>
    </div>
  );
};

export default TaxpayerForm;