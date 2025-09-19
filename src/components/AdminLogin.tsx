import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminLoginProps {
  onLogin: (adminCode: string) => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [adminCode, setAdminCode] = useState("");
  const [adminId, setAdminId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(adminId);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-xl">TC</span>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">
          Accès Administrateur
        </CardTitle>
        <Badge variant="destructive" className="w-fit mx-auto">
          Admin uniquement
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="adminId" className="text-sm font-medium">
              Identifiant Administrateur
            </Label>
            <Input
              id="adminId"
              type="text"
              placeholder="Entrez votre identifiant admin"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminCode" className="text-sm font-medium">
              Code d'accès Administrateur
            </Label>
            <Input
              id="adminCode"
              type="password"
              placeholder="Code d'accès sécurisé"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium py-3"
            disabled={!adminId || !adminCode}
          >
            Accéder au Tableau de Bord
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminLogin;