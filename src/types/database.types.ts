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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in_at: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          check_out_at: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          city_id: string | null
          created_at: string
          date: string
          id: string
          is_late: boolean
          profile_id: string
          updated_at: string
          work_mode: string
        }
        Insert: {
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          city_id?: string | null
          created_at?: string
          date?: string
          id?: string
          is_late?: boolean
          profile_id: string
          updated_at?: string
          work_mode?: string
        }
        Update: {
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          city_id?: string | null
          created_at?: string
          date?: string
          id?: string
          is_late?: boolean
          profile_id?: string
          updated_at?: string
          work_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          city_lead_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          launch_date: string | null
          name: string
          state: string | null
        }
        Insert: {
          city_lead_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          name: string
          state?: string | null
        }
        Update: {
          city_lead_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          name?: string
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_city_lead_id_fkey"
            columns: ["city_lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_lead_activities: {
        Row: {
          activity_type: string
          content: string
          created_at: string | null
          customer_lead_id: string
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          content: string
          created_at?: string | null
          customer_lead_id: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          content?: string
          created_at?: string | null
          customer_lead_id?: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_lead_activities_customer_lead_id_fkey"
            columns: ["customer_lead_id"]
            isOneToOne: false
            referencedRelation: "customer_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_lead_activities_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_leads: {
        Row: {
          assigned_to: string | null
          booking_amount: number | null
          budget_max: number | null
          budget_min: number | null
          city_id: string | null
          commission_earned: number | null
          created_at: string | null
          created_by: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          customer_whatsapp: string | null
          event_date: string | null
          event_type: string | null
          follow_up_date: string | null
          guest_count: number | null
          id: string
          last_contacted_at: string | null
          lost_reason: string | null
          matched_venue_id: string | null
          next_action: string | null
          notes: string | null
          pipeline_stage: string
          preferred_area: string | null
          preferred_city: string | null
          source: string | null
          special_requirements: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          booking_amount?: number | null
          budget_max?: number | null
          budget_min?: number | null
          city_id?: string | null
          commission_earned?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          customer_whatsapp?: string | null
          event_date?: string | null
          event_type?: string | null
          follow_up_date?: string | null
          guest_count?: number | null
          id?: string
          last_contacted_at?: string | null
          lost_reason?: string | null
          matched_venue_id?: string | null
          next_action?: string | null
          notes?: string | null
          pipeline_stage?: string
          preferred_area?: string | null
          preferred_city?: string | null
          source?: string | null
          special_requirements?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          booking_amount?: number | null
          budget_max?: number | null
          budget_min?: number | null
          city_id?: string | null
          commission_earned?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          customer_whatsapp?: string | null
          event_date?: string | null
          event_type?: string | null
          follow_up_date?: string | null
          guest_count?: number | null
          id?: string
          last_contacted_at?: string | null
          lost_reason?: string | null
          matched_venue_id?: string | null
          next_action?: string | null
          notes?: string | null
          pipeline_stage?: string
          preferred_area?: string | null
          preferred_city?: string | null
          source?: string | null
          special_requirements?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_leads_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_leads_matched_venue_id_fkey"
            columns: ["matched_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          head_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          head_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          head_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          id: string
          profile_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          id?: string
          profile_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          profile_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_financial_details: {
        Row: {
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_upi: string | null
          profile_id: string
          salary_allowances: number | null
          salary_basic: number | null
          salary_hra: number | null
          updated_at: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_upi?: string | null
          profile_id: string
          salary_allowances?: number | null
          salary_basic?: number | null
          salary_hra?: number | null
          updated_at?: string
        }
        Update: {
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_upi?: string | null
          profile_id?: string
          salary_allowances?: number | null
          salary_basic?: number | null
          salary_hra?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_financial_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          city_id: string | null
          created_at: string
          created_by: string | null
          description: string
          expense_date: string
          id: string
          is_active: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          expense_date?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          city_id: string | null
          created_at: string
          created_by: string | null
          customer_lead_id: string | null
          customer_name: string
          due_date: string | null
          id: string
          invoice_number: string
          issued_date: string
          notes: string | null
          paid_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_lead_id?: string | null
          customer_name: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_date?: string
          notes?: string | null
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_lead_id?: string | null
          customer_name?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_date?: string
          notes?: string | null
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_lead_id_fkey"
            columns: ["customer_lead_id"]
            isOneToOne: false
            referencedRelation: "customer_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: string
          content: string
          created_at: string | null
          id: string
          lead_id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          content: string
          created_at?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          content?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          capacity: string | null
          city_id: string | null
          created_at: string | null
          created_by: string | null
          deal_value: number | null
          expected_onboard_date: string | null
          follow_up_date: string | null
          id: string
          last_contacted_at: string | null
          lead_type: string | null
          lost_reason: string | null
          next_action: string | null
          notes: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          owner_whatsapp: string | null
          pipeline_stage: string | null
          price_range: string | null
          priority: string
          source: string | null
          status: string
          updated_at: string | null
          venue_address: string | null
          venue_area: string | null
          venue_category: string | null
          venue_id: string | null
          venue_name: string | null
          visit_date: string | null
          visit_done: boolean | null
        }
        Insert: {
          assigned_to?: string | null
          capacity?: string | null
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_value?: number | null
          expected_onboard_date?: string | null
          follow_up_date?: string | null
          id?: string
          last_contacted_at?: string | null
          lead_type?: string | null
          lost_reason?: string | null
          next_action?: string | null
          notes?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          owner_whatsapp?: string | null
          pipeline_stage?: string | null
          price_range?: string | null
          priority?: string
          source?: string | null
          status?: string
          updated_at?: string | null
          venue_address?: string | null
          venue_area?: string | null
          venue_category?: string | null
          venue_id?: string | null
          venue_name?: string | null
          visit_date?: string | null
          visit_done?: boolean | null
        }
        Update: {
          assigned_to?: string | null
          capacity?: string | null
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_value?: number | null
          expected_onboard_date?: string | null
          follow_up_date?: string | null
          id?: string
          last_contacted_at?: string | null
          lead_type?: string | null
          lost_reason?: string | null
          next_action?: string | null
          notes?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          owner_whatsapp?: string | null
          pipeline_stage?: string | null
          price_range?: string | null
          priority?: string
          source?: string | null
          status?: string
          updated_at?: string | null
          venue_address?: string | null
          venue_area?: string | null
          venue_category?: string | null
          venue_id?: string | null
          venue_name?: string | null
          visit_date?: string | null
          visit_done?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          annual_days: number | null
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          annual_days?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          annual_days?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      leaves: {
        Row: {
          created_at: string
          days: number
          end_date: string
          hr_decided_at: string | null
          hr_decided_by: string | null
          id: string
          leave_type_id: string
          profile_id: string
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: string
          team_lead_decided_at: string | null
          team_lead_decided_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          days: number
          end_date: string
          hr_decided_at?: string | null
          hr_decided_by?: string | null
          id?: string
          leave_type_id: string
          profile_id: string
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: string
          team_lead_decided_at?: string | null
          team_lead_decided_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          days?: number
          end_date?: string
          hr_decided_at?: string | null
          hr_decided_by?: string | null
          id?: string
          leave_type_id?: string
          profile_id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: string
          team_lead_decided_at?: string | null
          team_lead_decided_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaves_hr_decided_by_fkey"
            columns: ["hr_decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_team_lead_decided_by_fkey"
            columns: ["team_lead_decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          profile_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          city_id: string | null
          created_at: string
          date_of_birth: string | null
          date_of_joining: string | null
          department_id: string | null
          designation: string | null
          email: string
          emergency_contact: string | null
          employee_id: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          reporting_manager_id: string | null
          role_title: string | null
          team: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          city_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          department_id?: string | null
          designation?: string | null
          email: string
          emergency_contact?: string | null
          employee_id?: string | null
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          reporting_manager_id?: string | null
          role_title?: string | null
          team?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          city_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          department_id?: string | null
          designation?: string | null
          email?: string
          emergency_contact?: string | null
          employee_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          reporting_manager_id?: string | null
          role_title?: string | null
          team?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          id: string
          proficiency: string | null
          profile_id: string
          skill_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          proficiency?: string | null
          profile_id: string
          skill_name: string
        }
        Update: {
          created_at?: string
          id?: string
          proficiency?: string | null
          profile_id?: string
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          city_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          transaction_date: string
          type: string
        }
        Insert: {
          amount: number
          category?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          transaction_date?: string
          type: string
        }
        Update: {
          amount?: number
          category?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          transaction_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category: string | null
          city_id: string | null
          contact_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          city_id?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          city_id?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          agreement_date: string | null
          agreement_expiry: string | null
          agreement_status: string | null
          amenities: string[] | null
          area: string | null
          assigned_to: string | null
          capacity_max: number | null
          capacity_min: number | null
          category: string
          city: string
          city_id: string | null
          commission_percent: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          google_maps_url: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          listed_on_platform: boolean
          name: string
          notes: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          pipeline_stage: string | null
          price_per_day: number | null
          price_per_hour: number | null
          status: string
          test_booking_done: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          agreement_date?: string | null
          agreement_expiry?: string | null
          agreement_status?: string | null
          amenities?: string[] | null
          area?: string | null
          assigned_to?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          category: string
          city: string
          city_id?: string | null
          commission_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          listed_on_platform?: boolean
          name: string
          notes?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          pipeline_stage?: string | null
          price_per_day?: number | null
          price_per_hour?: number | null
          status?: string
          test_booking_done?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          agreement_date?: string | null
          agreement_expiry?: string | null
          agreement_status?: string | null
          amenities?: string[] | null
          area?: string | null
          assigned_to?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          category?: string
          city?: string
          city_id?: string | null
          commission_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          google_maps_url?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          listed_on_platform?: boolean
          name?: string
          notes?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          pipeline_stage?: string | null
          price_per_day?: number | null
          price_per_hour?: number | null
          status?: string
          test_booking_done?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_user_roles: { Args: { uid: string }; Returns: string[] }
      is_admin_or_founder: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
// =============================================================
// CONVENIENCE TYPES — used throughout the app
// =============================================================
export type VenueCategory =
  | 'banquet_hall' | 'rooftop' | 'farmhouse' | 'hotel'
  | 'resort' | 'restaurant' | 'conference_room' | 'outdoor' | 'other'

export type VenueStatus =
  | 'prospect' | 'contacted' | 'negotiating' | 'onboarded' | 'inactive'

export type LeadStatus =
  | 'new' | 'contacted' | 'interested' | 'negotiating' | 'won' | 'lost' | 'on_hold'

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent'

export type LeadSource =
  | 'cold_call' | 'referral' | 'walk_in' | 'instagram' | 'google' | 'other'

export type ActivityType =
  | 'note' | 'call' | 'visit' | 'email' | 'whatsapp' | 'status_change' | 'follow_up_set'

export interface Venue {
  id: string
  name: string
  city: string
  category: VenueCategory
  status: VenueStatus
  owner_name: string | null
  owner_phone: string | null
  owner_email: string | null
  address: string | null
  area: string | null
  capacity_min: number | null
  capacity_max: number | null
  price_per_day: number | null
  price_per_hour: number | null
  description: string | null
  amenities: string[] | null
  images: string[] | null
  google_maps_url: string | null
  is_featured: boolean
  is_active: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  venue_id: string
  assigned_to: string | null
  status: LeadStatus
  priority: LeadPriority
  source: LeadSource | null
  notes: string | null
  follow_up_date: string | null
  last_contacted_at: string | null
  expected_onboard_date: string | null
  lost_reason: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  performed_by: string | null
  activity_type: ActivityType
  content: string
  metadata: Record<string, unknown> | null
  created_at: string
}
