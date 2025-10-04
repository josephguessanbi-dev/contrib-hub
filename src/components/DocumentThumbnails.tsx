import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileIcon, FileText, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  nom_fichier: string;
  chemin_fichier: string;
  type_document: string;
  taille_fichier: number | null;
}

interface DocumentThumbnailsProps {
  contribuableId: string;
  className?: string;
}

const DocumentThumbnails = ({ contribuableId, className = "" }: DocumentThumbnailsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [contribuableId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('contribuable_id', contribuableId);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    // Si c'est une image, on pourrait charger l'URL depuis le storage
    // Pour l'instant, on affiche juste le chemin
    setImageUrl(doc.chemin_fichier);
  };

  const getFileIcon = (fileName: string, docType: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="w-4 h-4" />;
    }
    return <FileIcon className="w-4 h-4" />;
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={`text-xs text-muted-foreground ${className}`}>
        Aucun document
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleDocumentClick(doc)}
            className="group relative cursor-pointer"
          >
            <div className="w-16 h-16 border border-border rounded-md flex items-center justify-center bg-card hover:bg-accent transition-colors">
              {isImageFile(doc.nom_fichier) ? (
                <div className="w-full h-full flex items-center justify-center p-1">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {getFileIcon(doc.nom_fichier, doc.type_document)}
                  <span className="text-[8px] text-muted-foreground mt-1 uppercase">
                    {doc.nom_fichier.split('.').pop()}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              👁️
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] px-1 py-0.5 truncate rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
              {doc.nom_fichier}
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour afficher le document en grand */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedDocument.nom_fichier}</h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-center space-y-4">
                {isImageFile(selectedDocument.nom_fichier) ? (
                  <div className="w-full flex items-center justify-center bg-muted/20 rounded-lg p-4">
                    <div className="text-center">
                      <ImageIcon className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Aperçu de l'image non disponible
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Chemin: {selectedDocument.chemin_fichier}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center bg-muted/20 rounded-lg p-8">
                    <div className="text-center">
                      <FileText className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Type: {selectedDocument.type_document}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Chemin: {selectedDocument.chemin_fichier}
                      </p>
                      {selectedDocument.taille_fichier && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Taille: {(selectedDocument.taille_fichier / 1024).toFixed(2)} KB
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentThumbnails;
