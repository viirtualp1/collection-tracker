export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          order: number;
          background_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          order: number;
          background_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string | null;
          order?: number;
          background_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          user_id: string;
          room_id: string;
          name: string;
          description: string;
          image_url: string | null;
          position_x: number | null;
          position_y: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          room_id: string;
          name: string;
          description: string;
          image_url?: string | null;
          position_x?: number | null;
          position_y?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          room_id?: string;
          name?: string;
          description?: string;
          image_url?: string | null;
          position_x?: number | null;
          position_y?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

