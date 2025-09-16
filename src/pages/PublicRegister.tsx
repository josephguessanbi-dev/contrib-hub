import { useToast } from "@/hooks/use-toast";
import TaxpayerForm from "@/components/TaxpayerForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PublicRegister = () => {
  const { toast } = useToast();

  const handleSubmit = (data: any) => {
    console.log("Soumission publique contribuable:", data);
    toast({
      title: "Demande soumise",
      description: "Votre demande d'enregistrement a été envoyée et sera examinée par nos équipes.",
    });
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