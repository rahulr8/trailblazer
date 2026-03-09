export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          photo_url: string | null;
          membership_tier: string;
          total_km: number;
          total_minutes: number;
          total_steps: number;
          current_streak: number;
          last_activity_date: string | null;
          upgraded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          photo_url?: string | null;
          membership_tier?: string;
          total_km?: number;
          total_minutes?: number;
          total_steps?: number;
          current_streak?: number;
          last_activity_date?: string | null;
          upgraded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          photo_url?: string | null;
          membership_tier?: string;
          total_km?: number;
          total_minutes?: number;
          total_steps?: number;
          current_streak?: number;
          last_activity_date?: string | null;
          upgraded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      health_connections: {
        Row: {
          id: number;
          user_id: string;
          is_authorized: boolean;
          connected_at: string;
          last_sync_at: string | null;
        };
        Insert: {
          id?: never;
          user_id: string;
          is_authorized?: boolean;
          connected_at?: string;
          last_sync_at?: string | null;
        };
        Update: {
          id?: never;
          user_id?: string;
          is_authorized?: boolean;
          connected_at?: string;
          last_sync_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "health_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: number;
          user_id: string;
          source: string;
          external_id: string | null;
          type: string;
          duration: number;
          distance: number;
          location: string | null;
          date: string;
          elapsed_time: number | null;
          elevation_gain: number | null;
          name: string | null;
          sport_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          user_id: string;
          source: string;
          external_id?: string | null;
          type: string;
          duration: number;
          distance?: number;
          location?: string | null;
          date: string;
          elapsed_time?: number | null;
          elevation_gain?: number | null;
          name?: string | null;
          sport_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          user_id?: string;
          source?: string;
          external_id?: string | null;
          type?: string;
          duration?: number;
          distance?: number;
          location?: string | null;
          date?: string;
          elapsed_time?: number | null;
          elevation_gain?: number | null;
          name?: string | null;
          sport_type?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_adventures: {
        Row: {
          id: number;
          user_id: string;
          adventure_id: string;
          adventure_data: Json;
          saved_at: string;
        };
        Insert: {
          id?: never;
          user_id: string;
          adventure_id: string;
          adventure_data: Json;
          saved_at?: string;
        };
        Update: {
          id?: never;
          user_id?: string;
          adventure_id?: string;
          adventure_data?: Json;
          saved_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_adventures_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          user_id: string | null;
          started_at: string;
          last_message_at: string;
          message_count: number;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: number;
          conversation_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: never;
          conversation_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: never;
          conversation_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_message_count: {
        Args: {
          p_conversation_id: string;
        };
        Returns: undefined;
      };
      increment_user_stats: {
        Args: {
          p_user_id: string;
          p_km_delta?: number;
          p_minutes_delta?: number;
          p_steps_delta?: number;
        };
        Returns: undefined;
      };
      log_manual_activity: {
        Args: {
          p_user_id: string;
          p_type: string;
          p_duration: number;
          p_distance: number;
          p_location?: string | null;
        };
        Returns: number;
      };
      recalculate_user_stats: {
        Args: {
          p_user_id: string;
        };
        Returns: undefined;
      };
      reset_user_challenge: {
        Args: {
          p_user_id: string;
        };
        Returns: undefined;
      };
      update_streak: {
        Args: {
          p_user_id: string;
          p_activity_date?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
