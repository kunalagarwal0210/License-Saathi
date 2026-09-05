/**
 * Handwritten Supabase `Database` type — must match
 * `supabase/migrations/0001_initial_schema.sql` exactly.
 *
 * We cannot run `supabase gen types` without a live project (ticket 02 ships
 * schema-as-code only), so this is maintained by hand. If the migration
 * changes, update this file in the same commit.
 *
 * NOTE: every Row/Insert/Update/Database shape below is declared with `type`,
 * not `interface`. supabase-js's generic `.from(...).insert(...)` typing
 * resolves named `interface`s (which carry no implicit index signature) to
 * `never` deep in its generic plumbing — verified empirically against the
 * installed @supabase/supabase-js — so this file sticks to `type` aliases
 * throughout to keep insert/update/select typing working.
 */

export type BusinessCategory = "eatery" | "retail" | "salon";
export type LicenseStatus = "verified" | "flagged";
export type FieldNoteStatus = "new" | "reviewing" | "promoted" | "rejected";
export type ChecklistItemStatus = "pending" | "done";

/**
 * Answer-key predicate evaluated by the rules engine (ticket 03), e.g.
 * `{"turnover_band":"above_40L"}`, `{"seating":"gte_50"}`,
 * `{"premises_type":"cloud_kitchen"}`, `{"alcohol":true}`, or `{}` for
 * "always applies". Left as a loose JSON shape — the rules engine owns
 * interpreting individual keys.
 */
export type RuleCondition = Record<string, string | number | boolean>;

export type LicensesRow = {
  id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  govt_fee_inr: number | null;
  rough_timeline: string;
  portal_deep_link: string;
  required_documents: string[];
  source_url: string | null;
  last_verified_date: string | null; // date, ISO "YYYY-MM-DD"
  status: LicenseStatus;
  created_at: string;
  updated_at: string;
};
export type LicensesInsert = {
  name: string;
  description: string;
  category: BusinessCategory;
  govt_fee_inr?: number | null;
  rough_timeline: string;
  portal_deep_link: string;
  required_documents?: string[];
  source_url?: string | null;
  last_verified_date?: string | null;
  status?: LicenseStatus;
  id?: string;
  created_at?: string;
  updated_at?: string;
};
export type LicensesUpdate = Partial<LicensesInsert>;

export type RulesRow = {
  id: string;
  category: BusinessCategory;
  condition: RuleCondition;
  license_id: string;
  sequence: number;
  created_at: string;
  updated_at: string;
};
export type RulesInsert = {
  category: BusinessCategory;
  condition: RuleCondition;
  license_id: string;
  sequence: number;
  id?: string;
  created_at?: string;
  updated_at?: string;
};
export type RulesUpdate = Partial<RulesInsert>;

export type UsersRow = {
  id: string;
  phone: string;
  created_at: string;
};
export type UsersInsert = {
  phone: string;
  id?: string;
  created_at?: string;
};
export type UsersUpdate = Partial<UsersInsert>;

export type SavedChecklistsRow = {
  id: string;
  user_id: string;
  category: BusinessCategory;
  answers: Record<string, unknown>;
  created_at: string;
};
export type SavedChecklistsInsert = {
  user_id: string;
  category: BusinessCategory;
  answers: Record<string, unknown>;
  id?: string;
  created_at?: string;
};
export type SavedChecklistsUpdate = Partial<SavedChecklistsInsert>;

export type ChecklistItemsRow = {
  id: string;
  checklist_id: string;
  license_id: string;
  status: ChecklistItemStatus;
  created_at: string;
};
export type ChecklistItemsInsert = {
  checklist_id: string;
  license_id: string;
  status?: ChecklistItemStatus;
  id?: string;
  created_at?: string;
};
export type ChecklistItemsUpdate = Partial<ChecklistItemsInsert>;

export type FieldNotesRow = {
  id: string;
  license_id: string;
  what_happened: string;
  extra_doc: string | null;
  extra_fee: number | null;
  reporter_contact: string | null;
  status: FieldNoteStatus;
  created_at: string;
};
export type FieldNotesInsert = {
  license_id: string;
  what_happened: string;
  extra_doc?: string | null;
  extra_fee?: number | null;
  reporter_contact?: string | null;
  status?: FieldNoteStatus;
  id?: string;
  created_at?: string;
};
export type FieldNotesUpdate = Partial<FieldNotesInsert>;

/**
 * Row shape of the `field_notes_public` view (see migration) — every
 * `field_notes` column except `reporter_contact`, which is PII and must
 * never reach public/anon readers. Community/UI reads (ticket 08) should
 * query this view, never the raw `field_notes` table.
 */
export type FieldNotePublicRow = Omit<FieldNotesRow, "reporter_contact">;

/** Matches the shape produced by `supabase gen types typescript`. */
export type Database = {
  public: {
    Tables: {
      licenses: {
        Row: LicensesRow;
        Insert: LicensesInsert;
        Update: LicensesUpdate;
        Relationships: [];
      };
      rules: {
        Row: RulesRow;
        Insert: RulesInsert;
        Update: RulesUpdate;
        Relationships: [
          {
            foreignKeyName: "rules_license_id_fkey";
            columns: ["license_id"];
            referencedRelation: "licenses";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: UsersRow;
        Insert: UsersInsert;
        Update: UsersUpdate;
        Relationships: [];
      };
      saved_checklists: {
        Row: SavedChecklistsRow;
        Insert: SavedChecklistsInsert;
        Update: SavedChecklistsUpdate;
        Relationships: [
          {
            foreignKeyName: "saved_checklists_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_items: {
        Row: ChecklistItemsRow;
        Insert: ChecklistItemsInsert;
        Update: ChecklistItemsUpdate;
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey";
            columns: ["checklist_id"];
            referencedRelation: "saved_checklists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checklist_items_license_id_fkey";
            columns: ["license_id"];
            referencedRelation: "licenses";
            referencedColumns: ["id"];
          },
        ];
      };
      field_notes: {
        Row: FieldNotesRow;
        Insert: FieldNotesInsert;
        Update: FieldNotesUpdate;
        Relationships: [
          {
            foreignKeyName: "field_notes_license_id_fkey";
            columns: ["license_id"];
            referencedRelation: "licenses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      field_notes_public: {
        Row: FieldNotePublicRow;
        Relationships: [
          {
            foreignKeyName: "field_notes_license_id_fkey";
            columns: ["license_id"];
            referencedRelation: "licenses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      business_category: BusinessCategory;
      license_status: LicenseStatus;
      field_note_status: FieldNoteStatus;
      checklist_item_status: ChecklistItemStatus;
    };
  };
};
