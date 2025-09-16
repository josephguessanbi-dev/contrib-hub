import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LoginFormProps {
  onLogin: (role: "admin" | "personnel", workNumber: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [workNumber, setWorkNumber] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [role, setRole] = useState<"admin" | "personnel">("personnel");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation de connexion
    onLogin(role, workNumber);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium">
          Type de compte
        </Label>
        <Select value={role} onValueChange={(value) => setRole(value as "admin" | "personnel")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez votre rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">
              <div className="flex items-center space-x-2">
                <Badge variant="destructive" className="text-xs">Admin</Badge>
                <span>Administrateur</span>
              </div>
            </SelectItem>
            <SelectItem value="personnel">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">Staff</Badge>
                <span>Personnel</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workNumber" className="text-sm font-medium">
          Numéro de travail
        </Label>
        <Input
          id="workNumber"
          type="text"
          placeholder="Entrez votre numéro de travail"
          value={workNumber}
          onChange={(e) => setWorkNumber(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accessCode" className="text-sm font-medium">
          Code d'accès
        </Label>
        <Input
          id="accessCode"
          type="password"
          placeholder="Entrez votre code d'accès"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium py-2.5"
        disabled={!workNumber || !accessCode}
      >
        Se connecter
      </Button>

      <div className="mt-6 pt-6 border-t border-border">
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Accès public</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = "#/register"}
            >
              Enregistrer un contribuable
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export default LoginForm;