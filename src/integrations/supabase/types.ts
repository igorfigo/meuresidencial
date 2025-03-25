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
      accounting_report_logs: {
        Row: {
          created_at: string | null
          id: string
          matricula: string
          report_month: string
          sent_count: number
          sent_units: string | null
          sent_via: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          matricula: string
          report_month: string
          sent_count?: number
          sent_units?: string | null
          sent_via: string
        }
        Update: {
          created_at?: string | null
          id?: string
          matricula?: string
          report_month?: string
          sent_count?: number
          sent_units?: string | null
          sent_via?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          matricula: string
          sent_by_email: boolean | null
          sent_by_whatsapp: boolean | null
          sent_email: boolean | null
          sent_whatsapp: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          matricula: string
          sent_by_email?: boolean | null
          sent_by_whatsapp?: boolean | null
          sent_email?: boolean | null
          sent_whatsapp?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          matricula?: string
          sent_by_email?: boolean | null
          sent_by_whatsapp?: boolean | null
          sent_email?: boolean | null
          sent_whatsapp?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      balance_adjustments: {
        Row: {
          adjustment_date: string
          created_at: string
          id: string
          matricula: string
          new_balance: string
          observations: string | null
          previous_balance: string
          updated_at: string
        }
        Insert: {
          adjustment_date?: string
          created_at?: string
          id?: string
          matricula: string
          new_balance: string
          observations?: string | null
          previous_balance: string
          updated_at?: string
        }
        Update: {
          adjustment_date?: string
          created_at?: string
          id?: string
          matricula?: string
          new_balance?: string
          observations?: string | null
          previous_balance?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_document_attachments: {
        Row: {
          created_at: string
          document_id: string
          file_name: string
          file_path: string
          file_type: string
          id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_document_attachments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "business_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      business_documents: {
        Row: {
          created_at: string
          data_cadastro: string
          id: string
          matricula: string
          observacoes: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_cadastro: string
          id?: string
          matricula: string
          observacoes?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_cadastro?: string
          id?: string
          matricula?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      common_area_reservations: {
        Row: {
          common_area_id: string
          created_at: string
          end_time: string
          id: string
          notes: string | null
          reservation_date: string
          resident_id: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          common_area_id: string
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          reservation_date: string
          resident_id: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          common_area_id?: string
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          reservation_date?: string
          resident_id?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "common_area_reservations_common_area_id_fkey"
            columns: ["common_area_id"]
            isOneToOne: false
            referencedRelation: "common_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "common_area_reservations_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      common_areas: {
        Row: {
          capacity: number | null
          closing_time: string | null
          created_at: string
          description: string | null
          id: string
          matricula: string
          name: string
          opening_time: string | null
          rules: string | null
          updated_at: string
          weekdays: string[] | null
        }
        Insert: {
          capacity?: number | null
          closing_time?: string | null
          created_at?: string
          description?: string | null
          id?: string
          matricula: string
          name: string
          opening_time?: string | null
          rules?: string | null
          updated_at?: string
          weekdays?: string[] | null
        }
        Update: {
          capacity?: number | null
          closing_time?: string | null
          created_at?: string
          description?: string | null
          id?: string
          matricula?: string
          name?: string
          opening_time?: string | null
          rules?: string | null
          updated_at?: string
          weekdays?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "common_areas_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["matricula"]
          },
        ]
      }
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
          ativo: boolean | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          confirmarsenha: string | null
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
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          confirmarsenha?: string | null
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
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          confirmarsenha?: string | null
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
      document_attachments: {
        Row: {
          created_at: string
          document_id: string
          file_name: string
          file_path: string
          file_type: string
          id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_attachments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          data_cadastro: string
          id: string
          matricula: string
          observacoes: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_cadastro?: string
          id?: string
          matricula: string
          observacoes?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_cadastro?: string
          id?: string
          matricula?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_attachments: {
        Row: {
          created_at: string
          expense_id: string
          file_name: string
          file_path: string
          file_type: string
          id: string
        }
        Insert: {
          created_at?: string
          expense_id: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
        }
        Update: {
          created_at?: string
          expense_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_attachments_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "financial_expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_balance: {
        Row: {
          balance: string
          id: string
          is_manual: boolean | null
          matricula: string
          updated_at: string
        }
        Insert: {
          balance?: string
          id?: string
          is_manual?: boolean | null
          matricula: string
          updated_at?: string
        }
        Update: {
          balance?: string
          id?: string
          is_manual?: boolean | null
          matricula?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_balance_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: true
            referencedRelation: "condominiums"
            referencedColumns: ["matricula"]
          },
        ]
      }
      financial_expenses: {
        Row: {
          amount: string
          category: string
          created_at: string
          due_date: string | null
          id: string
          matricula: string
          observations: string | null
          payment_date: string | null
          reference_month: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          amount: string
          category: string
          created_at?: string
          due_date?: string | null
          id?: string
          matricula: string
          observations?: string | null
          payment_date?: string | null
          reference_month: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          amount?: string
          category?: string
          created_at?: string
          due_date?: string | null
          id?: string
          matricula?: string
          observations?: string | null
          payment_date?: string | null
          reference_month?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_expenses_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["matricula"]
          },
        ]
      }
      financial_incomes: {
        Row: {
          amount: string
          category: string
          created_at: string
          id: string
          matricula: string
          observations: string | null
          payment_date: string | null
          reference_month: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          amount: string
          category: string
          created_at?: string
          id?: string
          matricula: string
          observations?: string | null
          payment_date?: string | null
          reference_month: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          amount?: string
          category?: string
          created_at?: string
          id?: string
          matricula?: string
          observations?: string | null
          payment_date?: string | null
          reference_month?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_incomes_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["matricula"]
          },
        ]
      }
      news_items: {
        Row: {
          created_at: string
          full_content: string
          id: string
          is_active: boolean | null
          matricula: string | null
          short_description: string
          title: string
        }
        Insert: {
          created_at?: string
          full_content: string
          id?: string
          is_active?: boolean | null
          matricula?: string | null
          short_description: string
          title: string
        }
        Update: {
          created_at?: string
          full_content?: string
          id?: string
          is_active?: boolean | null
          matricula?: string | null
          short_description?: string
          title?: string
        }
        Relationships: []
      }
      pest_control_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          pest_control_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          pest_control_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          pest_control_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pest_control_attachments_pest_control_id_fkey"
            columns: ["pest_control_id"]
            isOneToOne: false
            referencedRelation: "pest_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      pest_controls: {
        Row: {
          created_at: string
          data: string
          empresa: string
          finalidade: string[]
          id: string
          matricula: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: string
          empresa: string
          finalidade: string[]
          id?: string
          matricula: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          empresa?: string
          finalidade?: string[]
          id?: string
          matricula?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pest_controls_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["matricula"]
          },
        ]
      }
      pix_keys: {
        Row: {
          chavepix: string
          created_at: string
          id: string
          jurosaodia: string | null
          tipochave: string
        }
        Insert: {
          chavepix: string
          created_at?: string
          id?: string
          jurosaodia?: string | null
          tipochave: string
        }
        Update: {
          chavepix?: string
          created_at?: string
          id?: string
          jurosaodia?: string | null
          tipochave?: string
        }
        Relationships: []
      }
      pix_receipt_settings: {
        Row: {
          chavepix: string
          created_at: string
          diavencimento: string
          jurosaodia: string
          matricula: string
          tipochave: string
          updated_at: string
        }
        Insert: {
          chavepix: string
          created_at?: string
          diavencimento?: string
          jurosaodia?: string
          matricula: string
          tipochave: string
          updated_at?: string
        }
        Update: {
          chavepix?: string
          created_at?: string
          diavencimento?: string
          jurosaodia?: string
          matricula?: string
          tipochave?: string
          updated_at?: string
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
      residents: {
        Row: {
          cpf: string
          created_at: string
          email: string | null
          id: string
          matricula: string
          nome_completo: string
          telefone: string | null
          unidade: string
          updated_at: string
          valor_condominio: string | null
        }
        Insert: {
          cpf: string
          created_at?: string
          email?: string | null
          id?: string
          matricula: string
          nome_completo: string
          telefone?: string | null
          unidade: string
          updated_at?: string
          valor_condominio?: string | null
        }
        Update: {
          cpf?: string
          created_at?: string
          email?: string | null
          id?: string
          matricula?: string
          nome_completo?: string
          telefone?: string | null
          unidade?: string
          updated_at?: string
          valor_condominio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["matricula"]
          },
        ]
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
