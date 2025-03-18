export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      condominium_change_logs: {
        Row: {
          campo: string
          data_alteracao: string
          id: string
          matricula: string
          usuario: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          campo: string
          data_alteracao?: string
          id?: string
          matricula: string
          usuario?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          campo?: string
          data_alteracao?: string
          id?: string
          matricula?: string
          usuario?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condominium_change_logs_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["matricula"]
          },
        ]
      }
      condominiums: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          bairro: string | null
          banco: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          confirmarsenha: string | null
          conta: string | null
          created_at: string | null
          desconto: string | null
          emaillegal: string | null
          enderecolegal: string | null
          estado: string | null
          formapagamento: string | null
          id: string
          matricula: string
          nomecondominio: string | null
          nomelegal: string | null
          numero: string | null
          pix: string | null
          planocontratado: string | null
          rua: string | null
          senha: string | null
          telefonelegal: string | null
          tipodocumento: string | null
          updated_at: string | null
          valormensal: string | null
          valorplano: string | null
          vencimento: string | null
          welcome_email_sent: boolean | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          confirmarsenha?: string | null
          conta?: string | null
          created_at?: string | null
          desconto?: string | null
          emaillegal?: string | null
          enderecolegal?: string | null
          estado?: string | null
          formapagamento?: string | null
          id?: string
          matricula: string
          nomecondominio?: string | null
          nomelegal?: string | null
          numero?: string | null
          pix?: string | null
          planocontratado?: string | null
          rua?: string | null
          senha?: string | null
          telefonelegal?: string | null
          tipodocumento?: string | null
          updated_at?: string | null
          valormensal?: string | null
          valorplano?: string | null
          vencimento?: string | null
          welcome_email_sent?: boolean | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          confirmarsenha?: string | null
          conta?: string | null
          created_at?: string | null
          desconto?: string | null
          emaillegal?: string | null
          enderecolegal?: string | null
          estado?: string | null
          formapagamento?: string | null
          id?: string
          matricula?: string
          nomecondominio?: string | null
          nomelegal?: string | null
          numero?: string | null
          pix?: string | null
          planocontratado?: string | null
          rua?: string | null
          senha?: string | null
          telefonelegal?: string | null
          tipodocumento?: string | null
          updated_at?: string | null
          valormensal?: string | null
          valorplano?: string | null
          vencimento?: string | null
          welcome_email_sent?: boolean | null
        }
        Relationships: []
      }
      plan_change_logs: {
        Row: {
          campo: string
          codigo: string
          data_alteracao: string | null
          id: string
          usuario: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          campo: string
          codigo: string
          data_alteracao?: string | null
          id?: string
          usuario?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          campo?: string
          codigo?: string
          data_alteracao?: string | null
          id?: string
          usuario?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_change_logs_codigo_fkey"
            columns: ["codigo"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["codigo"]
          },
        ]
      }
      plans: {
        Row: {
          codigo: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
          valor: string
        }
        Insert: {
          codigo: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          valor: string
        }
        Update: {
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
