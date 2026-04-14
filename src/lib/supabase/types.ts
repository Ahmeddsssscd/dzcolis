export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string;
          wilaya: string;
          role: "user" | "admin";
          kyc_status: "none" | "submitted" | "reviewing" | "approved" | "rejected";
          referral_code: string | null;
          referred_by: string | null;
          rating: number;
          review_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "rating" | "review_count">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          from_city: string;
          to_city: string;
          departure_date: string;
          arrival_date: string | null;
          available_weight: number;
          price_per_kg: number;
          description: string;
          status: "active" | "full" | "cancelled" | "completed";
          is_international: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          listing_id: string;
          sender_id: string;
          weight: number;
          dimensions: string | null;
          content: string;
          pickup_address: string;
          recipient_name: string;
          recipient_phone: string;
          instructions: string | null;
          status: "pending" | "accepted" | "in_transit" | "delivered" | "cancelled";
          payment_status: "unpaid" | "pending" | "paid" | "refunded";
          total_amount: number;
          booking_ref: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "booking_ref" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          amount: number;
          currency: string;
          provider: string;
          provider_ref: string | null;
          checkout_url: string | null;
          status: "pending" | "paid" | "failed" | "refunded";
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      kyc_documents: {
        Row: {
          id: string;
          user_id: string;
          cin_recto_url: string | null;
          cin_verso_url: string | null;
          selfie_url: string | null;
          status: "submitted" | "reviewing" | "approved" | "rejected";
          admin_note: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["kyc_documents"]["Row"], "id" | "submitted_at">;
        Update: Partial<Database["public"]["Tables"]["kyc_documents"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          reviewer_id: string;
          reviewed_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          data: Json | null;
          created_at: string;
          // Note: "body" is an alias used in code — maps to "message" in DB
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string;
          sender_id: string;
          transporter_id: string;
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
    };
  };
}

// Convenience row types
export type Profile      = Database["public"]["Tables"]["profiles"]["Row"];
export type Listing      = Database["public"]["Tables"]["listings"]["Row"];
export type Booking      = Database["public"]["Tables"]["bookings"]["Row"];
export type Payment      = Database["public"]["Tables"]["payments"]["Row"];
export type KycDoc       = Database["public"]["Tables"]["kyc_documents"]["Row"];
export type Review       = Database["public"]["Tables"]["reviews"]["Row"];
export type Notification  = Database["public"]["Tables"]["notifications"]["Row"];
export type Conversation  = Database["public"]["Tables"]["conversations"]["Row"];
export type DbMessage     = Database["public"]["Tables"]["messages"]["Row"];
