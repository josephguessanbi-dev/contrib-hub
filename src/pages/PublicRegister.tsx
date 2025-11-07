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
              type_document: 'autre',
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-card/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </Button>
              <img src="/logo.png" alt="Le Royaume CGA" className="h-12 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Le Royaume CGA</h1>
                <p className="text-xs text-muted-foreground">Gestion des contribuables</p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Se connecter
            </Button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Card className="bg-card/60 backdrop-blur-sm border-primary/30 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Information importante</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ce formulaire est destiné à l'enregistrement public des contribuables. 
                    Votre demande sera examinée par nos équipes avant validation. 
                    <span className="font-medium text-foreground"> Assurez-vous de remplir tous les champs requis.</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form */}
      <div className="relative">
        <TaxpayerForm onSubmit={handleSubmit} isPublic={true} />
      </div>
    </div>
  );
};

export default PublicRegister;