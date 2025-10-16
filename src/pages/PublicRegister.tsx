import { useToast } from "@/hooks/use-toast";
import TaxpayerForm from "@/components/TaxpayerForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const PublicRegister = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const { documents, ...contribuableData } = data;
      
      // Organisation par défaut pour les inscriptions publiques
      const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
      
      // Insérer le contribuable avec statut "en_attente"
      const { data: newContribuable, error: contribuableError } = await supabase
        .from('contribuables')
        .insert({
          ...contribuableData,
          organisation_id: DEFAULT_ORG_ID,
          statut: 'en_attente'
        })
        .select()
        .single();

      if (contribuableError) {
        console.error('Erreur contribuable:', contribuableError);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer votre demande. Veuillez réessayer.",
          variant: "destructive"
        });
        return;
      }

      // Uploader les documents si présents
      if (documents && documents.length > 0) {
        for (const file of documents) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${newContribuable.id}/${Date.now()}-${file.name}`;
          
          // Upload du fichier dans le storage
          const { error: uploadError } = await supabase.storage
            .from('contribuables-documents')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Erreur upload:', uploadError);
            continue;
          }

          // Enregistrer la référence dans la table documents
          await supabase
            .from('documents')
            .insert({
              contribuable_id: newContribuable.id,
              nom_fichier: file.name,
              chemin_fichier: fileName,
              type_document: fileExt || 'autre',
              taille_fichier: file.size
            });
        }
      }

      toast({
        title: "Demande soumise avec succès",
        description: documents?.length > 0 
          ? `Votre demande et ${documents.length} document(s) ont été envoyés. Nos équipes l'examineront prochainement.`
          : "Votre demande a été envoyée et sera examinée par nos équipes."
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold">TC</span>
              </div>
              <div>
                <h1 className="font-bold text-foreground">TaxContrib</h1>
                <p className="text-xs text-muted-foreground">Gestion des contribuables</p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/"}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-semibold text-foreground">Information importante</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ce formulaire est destiné à l'enregistrement public des contribuables. 
                    Votre demande sera examinée par nos équipes avant validation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form */}
      <TaxpayerForm onSubmit={handleSubmit} isPublic={true} />
    </div>
  );
};

export default PublicRegister;