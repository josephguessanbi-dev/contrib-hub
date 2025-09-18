import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WelcomeCardProps {
  user: {
    role: "admin" | "personnel";
    workNumber: string;
    name: string;
  };
  onNavigate: (view: string) => void;
}

const WelcomeCard = ({ user, onNavigate }: WelcomeCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-foreground">
              Bonjour, {user.name}
            </CardTitle>
            <p className="text-muted-foreground flex items-center space-x-2 mt-1">
              <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className="text-xs">
                {user.role === "admin" ? "Admin" : "Staff"}
              </Badge>
              <span>•</span>
              <span>#{user.workNumber}</span>
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center">
            <span className="text-2xl text-primary-foreground">
              {user.role === "admin" ? "👨‍💼" : "👩‍💻"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {user.role === "admin" 
              ? "Vous avez accès à toutes les fonctionnalités d'administration du système." 
              : "Vous pouvez enregistrer et gérer les contribuables."
            }
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              onClick={() => onNavigate("register")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              ➕ Nouveau contribuable
            </Button>
            
            {user.role === "admin" && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onNavigate("add-employee")}
              >
                👤 Ajouter employé
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onNavigate("taxpayers")}
            >
              📋 Voir contribuables
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;