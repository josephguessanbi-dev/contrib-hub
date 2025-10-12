export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contribuables: {
        Row: {
          commentaire: string | null
          commune: string
          contact_1: string
          contact_2: string | null
          created_at: string
          created_by: string | null
          id: string
          latitude: number | null
          longitude: number | null
          ncc: string | null
          nom_gerant: string
          organisation_id: string
          photo_position: string | null
          prenom_gerant: string
          quartier: string | null
          raison_sociale: string
          rccm: string | null
          statut: Database["public"]["Enums"]["taxpayer_status"]
          updated_at: string
          ville: string
        }
        Insert: {
          commentaire?: string | null
          commune: string
          contact_1: string
          contact_2?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          ncc?: string | null
          nom_gerant: string
          organisation_id: string
          photo_position?: string | null
          prenom_gerant: string
          quartier?: string | null
          raison_sociale: string
          rccm?: string | null
          statut?: Database["public"]["Enums"]["taxpayer_status"]
          updated_at?: string
          ville: string
        }
        Update: {
          commentaire?: string | null
          commune?: string
          contact_1?: string
          contact_2?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          ncc?: string | null
          nom_gerant?: string
          organisation_id?: string
          photo_position?: string | null
          prenom_gerant?: string
          quartier?: string | null
          raison_sociale?: string
          rccm?: string | null
          statut?: Database["public"]["Enums"]["taxpayer_status"]
          updated_at?: string
          ville?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribuables_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_requests: {
        Row: {
          approved_by: string | null
          contribuable_id: string
          created_at: string
          id: string
          reason: string | null
          requested_by: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          approved_by?: string | null
          contribuable_id: string
          created_at?: string
          id?: string
          reason?: string | null
          requested_by: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          approved_by?: string | null
          contribuable_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          requested_by?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deletion_requests_contribuable_id_fkey"
            columns: ["contribuable_id"]
            isOneToOne: false
            referencedRelation: "contribuables"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          chemin_fichier: string
          contribuable_id: string
          created_at: string
          id: string
          nom_fichier: string
          taille_fichier: number | null
          type_document: Database["public"]["Enums"]["document_type"]
        }
        Insert: {
          chemin_fichier: string
          contribuable_id: string
          created_at?: string
          id?: string
          nom_fichier: string
          taille_fichier?: number | null
          type_document: Database["public"]["Enums"]["document_type"]
        }
        Update: {
          chemin_fichier?: string
          contribuable_id?: string
          created_at?: string
          id?: string
          nom_fichier?: string
          taille_fichier?: number | null
          type_document?: Database["public"]["Enums"]["document_type"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_contribuable_id_fkey"
            columns: ["contribuable_id"]
            isOneToOne: false
            referencedRelation: "contribuables"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          created_at: string
          id: string
          nom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          contacts: string | null
          created_at: string
          email: string | null
          id: string
          nom: string
          numero_travail: string | null
          organisation_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contacts?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom: string
          numero_travail?: string | null
          organisation_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contacts?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          numero_travail?: string | null
          organisation_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organisation_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organisation_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organisation_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organisation: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_role: {
        Args: { org_uuid: string; user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "personnel"
      document_type: "registre_commerce" | "dfe" | "piece_identite" | "autre"
      taxpayer_status: "en_attente" | "valide" | "rejete"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "personnel"],
      document_type: ["registre_commerce", "dfe", "piece_identite", "autre"],
      taxpayer_status: ["en_attente", "valide", "rejete"],
    },
  },
} as const
