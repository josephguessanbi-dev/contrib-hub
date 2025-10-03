import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface EmployeeData {
  id: string;
  user_id: string;
  nom: string;
  email: string;
  numero_travail: string | null;
  role: "admin" | "personnel";
  statut: "actif" | "inactif" | "suspendu";
  organisation_id: string;
}

interface EmployeeDetailProps {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const EmployeeDetail = ({ employeeId, open, onOpenChange, onUpdate }: EmployeeDetailProps) => {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (employeeId && open) {
      fetchEmployeeDetails();
    }
  }, [employeeId, open]);

  const fetchEmployeeDetails = async () => {
    if (!employeeId) return;

    setIsLoading(true);
    try {
      // Récupérer le profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (profileError) throw profileError;

      // Récupérer le rôle
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id)
        .eq('organisation_id', profile.organisation_id)
        .maybeSingle();

      // Récupérer l'email de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      
      setEmployee({
        id: profile.id,
        user_id: profile.user_id,
        nom: profile.nom,
        email: user?.email || 'N/A',
        numero_travail: profile.numero_travail,
        role: (roleData?.role as "admin" | "personnel") || 'personnel',
        statut: 'actif',
        organisation_id: profile.organisation_id
      });
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de l'agent",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!employee) return;

    setIsSaving(true);
    try {
      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nom: employee.nom,
          numero_travail: employee.numero_travail
        })
        .eq('id', employee.id);

      if (profileError) throw profileError;

      // Mettre à jour le rôle
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: employee.role })
        .eq('user_id', employee.user_id)
        .eq('organisation_id', employee.organisation_id);

      if (roleError) throw roleError;

      toast({
        title: "Succès",
        description: "Les informations de l'agent ont été mises à jour"
      });

      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!employee) return;

    const newStatus = employee.statut === 'actif' ? 'suspendu' : 'actif';
    
    setEmployee({ ...employee, statut: newStatus });
    
    toast({
      title: newStatus === 'suspendu' ? "Agent suspendu" : "Agent réactivé",
      description: `Le statut a été changé à "${newStatus}"`
    });
  };

  const handleDelete = async () => {
    if (!employee) return;

    setIsSaving(true);
    try {
      // Supprimer le profil (les rôles seront supprimés en cascade si configuré)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', employee.id);

      if (profileError) throw profileError;

      // Supprimer le rôle
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', employee.user_id);

      if (roleError) console.warn('Erreur lors de la suppression du rôle:', roleError);

      toast({
        title: "Agent supprimé",
        description: "L'agent a été supprimé avec succès"
      });

      onUpdate?.();
      onOpenChange(false);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'agent",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>;
      case "suspendu":
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  if (!employee && !isLoading) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Détails de l'agent
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-muted-foreground">Chargement...</span>
            </div>
          ) : employee ? (
            <div className="space-y-6">
              {/* Statut actuel */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Statut actuel</p>
                  {getStatusBadge(employee.statut)}
                </div>
                <Button
                  variant={employee.statut === 'actif' ? 'destructive' : 'default'}
                  size="sm"
                  onClick={handleToggleStatus}
                >
                  {employee.statut === 'actif' ? '🚫 Suspendre' : '✅ Réactiver'}
                </Button>
              </div>

              {/* Informations de base */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom complet *</Label>
                  <Input
                    id="nom"
                    value={employee.nom}
                    onChange={(e) => setEmployee({ ...employee, nom: e.target.value })}
                    placeholder="Nom de l'agent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={employee.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_travail">Numéro de travail</Label>
                  <Input
                    id="numero_travail"
                    value={employee.numero_travail || ''}
                    onChange={(e) => setEmployee({ ...employee, numero_travail: e.target.value })}
                    placeholder="Ex: EMP001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle *</Label>
                  <Select 
                    value={employee.role} 
                    onValueChange={(value: "admin" | "personnel") => 
                      setEmployee({ ...employee, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personnel">Personnel</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                >
                  {isSaving ? "Enregistrement..." : "💾 Enregistrer les modifications"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                  className="sm:w-auto"
                >
                  Annuler
                </Button>
              </div>

              {/* Zone de danger */}
              <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                <h3 className="text-sm font-semibold text-destructive mb-2">Zone de danger</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  La suppression de cet agent est irréversible. Toutes ses données seront supprimées.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSaving}
                >
                  🗑️ Supprimer cet agent
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet agent ? Cette action est irréversible et toutes les données associées seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmployeeDetail;
