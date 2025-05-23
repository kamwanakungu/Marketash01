export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bids: {
        Row: {
          id: string
          product_id: string
          user_id: string
          amount: number
          status: string
          rejection_reason: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          amount: number
          status?: string
          rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          amount?: number
          status?: string
          rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      chat_rooms: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          product_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          product_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          product_id?: string
          created_at?: string | null
        }
      }
      credit_applications: {
        Row: {
          id: string
          farmer_id: string
          amount: number
          purpose: string
          status: string
          approved_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          farmer_id: string
          amount: number
          purpose: string
          status?: string
          approved_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          farmer_id?: string
          amount?: number
          purpose?: string
          status?: string
          approved_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      crop_diagnosis: {
        Row: {
          id: string
          user_id: string
          image_url: string
          crop_type: string
          diagnosis: string
          confidence_score: number
          recommendation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          crop_type: string
          diagnosis: string
          confidence_score: number
          recommendation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          crop_type?: string
          diagnosis?: string
          confidence_score?: number
          recommendation?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          read?: boolean | null
          created_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean | null
          data: Json | null
          reference_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean | null
          data?: Json | null
          reference_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean | null
          data?: Json | null
          reference_id?: string | null
          created_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          image: string
          base_price: number
          unit: string
          quantity: number
          location: string
          harvest_date: string | null
          category: string
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          image: string
          base_price: number
          unit: string
          quantity: number
          location: string
          harvest_date?: string | null
          category: string
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          image?: string
          base_price?: number
          unit?: string
          quantity?: number
          location?: string
          harvest_date?: string | null
          category?: string
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          location: string | null
          credit_score: number | null
          user_type: string | null
          rating: number | null
          created_at: string | null
          updated_at: string | null
          is_online: boolean | null
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          location?: string | null
          credit_score?: number | null
          user_type?: string | null
          rating?: number | null
          created_at?: string | null
          updated_at?: string | null
          is_online?: boolean | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          location?: string | null
          credit_score?: number | null
          user_type?: string | null
          rating?: number | null
          created_at?: string | null
          updated_at?: string | null
          is_online?: boolean | null
        }
      }
      transactions: {
        Row: {
          id: string
          product_id: string
          bid_id: string | null
          buyer_id: string
          seller_id: string
          amount: number
          status: string
          payment_method: string | null
          payment_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          bid_id?: string | null
          buyer_id: string
          seller_id: string
          amount: number
          status?: string
          payment_method?: string | null
          payment_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          bid_id?: string | null
          buyer_id?: string
          seller_id?: string
          amount?: number
          status?: string
          payment_method?: string | null
          payment_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
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
  }
}