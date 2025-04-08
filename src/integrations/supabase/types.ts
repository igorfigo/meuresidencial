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
      business_contracts: {
        Row: {
          counterparty: string
          created_at: string
          end_date: string
          id: string
          start_date: string
          status: string
          title: string
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          counterparty: string
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          status: string
          title: string
          type: string
          updated_at?: string
          value: number
        }
        Update: {
          counterparty?: string
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      business_contracts_attachments: {
        Row: {
          contract_id: string
          created_at: string
          file_name: string
          file_path: string
          file_type: string
          id: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_contracts_attachments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "business_contracts"
            referencedColumns: ["id"]
          },
        ]
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
          date: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      common_area_reservations: {
        Row: {
          common_area_id: string
          created_at: string
          id: string
          reservation_date: string
          resident_id: string
          updated_at: string
        }
        Insert: {
          common_area_id: string
          created_at?: string
          id?: string
          reservation_date: string
          resident_id: string
          updated_at?: string
        }
        Update: {
          common_area_id?: string
          created_at?: string
          id?: string
          reservation_date?: string
          resident_id?: string
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
          valor: string | null
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
          valor?: string | null
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
          valor?: string | null
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
      garage_listings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_available: boolean | null
          matricula: string
          resident_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean | null
          matricula: string
          resident_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean | null
          matricula?: string
          resident_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "garage_listings_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
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
      pix_key_meuresidencial: {
        Row: {
          chavepix: string
          created_at: string
          diavencimento: string
          id: string
          jurosaodia: string | null
          tipochave: string
        }
        Insert: {
          chavepix: string
          created_at?: string
          diavencimento?: string
          id?: string
          jurosaodia?: string | null
          tipochave: string
        }
        Update: {
          chavepix?: string
          created_at?: string
          diavencimento?: string
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
          max_moradores: number | null
          nome: string
          updated_at: string | null
          valor: string
        }
        Insert: {
          codigo: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          max_moradores?: number | null
          nome: string
          updated_at?: string | null
          valor: string
        }
        Update: {
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          max_moradores?: number | null
          nome?: string
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      preventive_maintenance: {
        Row: {
          category: string
          completed: boolean | null
          created_at: string
          description: string | null
          id: string
          matricula: string
          scheduled_date: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          matricula: string
          scheduled_date: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          matricula?: string
          scheduled_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      resident_charges: {
        Row: {
          amount: string
          created_at: string
          due_date: string
          id: string
          matricula: string
          month: string
          payment_date: string | null
          resident_id: string
          status: string
          unit: string
          updated_at: string
          year: string
        }
        Insert: {
          amount: string
          created_at?: string
          due_date: string
          id?: string
          matricula: string
          month: string
          payment_date?: string | null
          resident_id: string
          status?: string
          unit: string
          updated_at?: string
          year: string
        }
        Update: {
          amount?: string
          created_at?: string
          due_date?: string
          id?: string
          matricula?: string
          month?: string
          payment_date?: string | null
          resident_id?: string
          status?: string
          unit?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      residents: {
        Row: {
          active: boolean
          cpf: string
          created_at: string
          email: string | null
          id: string
          matricula: string
          nome_completo: string
          telefone: string | null
          unidade: string
          updated_at: string
          user_id: string | null
          valor_condominio: string | null
        }
        Insert: {
          active?: boolean
          cpf: string
          created_at?: string
          email?: string | null
          id?: string
          matricula: string
          nome_completo: string
          telefone?: string | null
          unidade: string
          updated_at?: string
          user_id?: string | null
          valor_condominio?: string | null
        }
        Update: {
          active?: boolean
          cpf?: string
          created_at?: string
          email?: string | null
          id?: string
          matricula?: string
          nome_completo?: string
          telefone?: string | null
          unidade?: string
          updated_at?: string
          user_id?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          matricula: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          matricula?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          matricula?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_preventive_maintenance: {
        Args: {
          p_category: string
          p_title: string
          p_description: string
          p_scheduled_date: string
        }
        Returns: string
      }
      delete_preventive_maintenance: {
        Args: { p_id: string }
        Returns: boolean
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_preventive_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          completed: boolean | null
          created_at: string
          description: string | null
          id: string
          matricula: string
          scheduled_date: string
          title: string
          updated_at: string
        }[]
      }
      get_user_matricula: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      toggle_preventive_maintenance_status: {
        Args: { p_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
