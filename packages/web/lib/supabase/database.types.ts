/**
 * Hand-written Database types aligned with
 * `supabase/migrations/20260917200000_create_pantry_items.sql`.
 * Regenerate from Supabase when the schema evolves.
 */

export type PantryUnit = "units" | "kg" | "g" | "l" | "ml";
export type PantryCategory = "pantry" | "fridge" | "freezer";

export interface Database {
  public: {
    Tables: {
      pantry_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          quantity: number;
          unit: string;
          category: string;
          expiry_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          quantity?: number;
          unit?: string;
          category?: string;
          expiry_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          category?: string;
          expiry_date?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pantry_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type PantryItemRow = Database["public"]["Tables"]["pantry_items"]["Row"];
export type PantryItemInsert =
  Database["public"]["Tables"]["pantry_items"]["Insert"];
export type PantryItemUpdate =
  Database["public"]["Tables"]["pantry_items"]["Update"];
