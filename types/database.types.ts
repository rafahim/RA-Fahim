/**
 * Hand-authored Supabase schema types for the portfolio CMS.
 *
 * These mirror `supabase/migrations/20260814120000_init_cms_schema.sql`
 * exactly. Once that migration has been applied to a real Supabase
 * project, this file can be regenerated with the Supabase CLI:
 *
 *   supabase gen types typescript --project-id <project-ref> > src/types/database.types.ts
 *
 * Tables:
 * - projects           Portfolio project entries.
 * - project_images     Gallery images belonging to a project.
 * - services           Service offerings.
 * - about              Singleton row of about/profile content.
 * - contact_settings   Singleton row of public contact/social links.
 * - website_settings   Singleton row of site title/SEO/branding.
 * - messages           Contact-form submissions.
 * - admin_users         Allow-list of Supabase Auth users with admin access.
 * - marquee_images     Scrolling image strip shown below the Hero section.
 */

export type ProjectStatus = 'draft' | 'published';

export interface SocialLinkJson {
  label: string;
  url: string;
}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          category: string;
          client_type: string | null;
          short_description: string | null;
          full_description: string | null;
          project_url: string | null;
          year: number | null;
          featured_image: string | null;
          featured_image_public_id: string | null;
          status: ProjectStatus;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          client_type?: string | null;
          short_description?: string | null;
          full_description?: string | null;
          project_url?: string | null;
          year?: number | null;
          featured_image?: string | null;
          featured_image_public_id?: string | null;
          status?: ProjectStatus;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          client_type?: string | null;
          short_description?: string | null;
          full_description?: string | null;
          project_url?: string | null;
          year?: number | null;
          featured_image?: string | null;
          featured_image_public_id?: string | null;
          status?: ProjectStatus;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          cloudinary_public_id: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          cloudinary_public_id?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          image_url?: string;
          cloudinary_public_id?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_images_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      services: {
        Row: {
          id: string;
          service_number: string;
          name: string;
          description: string | null;
          display_order: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_number: string;
          name: string;
          description?: string | null;
          display_order?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_number?: string;
          name?: string;
          description?: string | null;
          display_order?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      about: {
        Row: {
          id: number;
          name: string | null;
          professional_title: string | null;
          experience: string | null;
          about_heading: string | null;
          about_description: string | null;
          additional_info: string | null;
          profile_image_url: string | null;
          profile_image_public_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name?: string | null;
          professional_title?: string | null;
          experience?: string | null;
          about_heading?: string | null;
          about_description?: string | null;
          additional_info?: string | null;
          profile_image_url?: string | null;
          profile_image_public_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string | null;
          professional_title?: string | null;
          experience?: string | null;
          about_heading?: string | null;
          about_description?: string | null;
          additional_info?: string | null;
          profile_image_url?: string | null;
          profile_image_public_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_settings: {
        Row: {
          id: number;
          email: string | null;
          phone: string | null;
          whatsapp: string | null;
          facebook: string | null;
          instagram: string | null;
          linkedin: string | null;
          behance: string | null;
          other_links: SocialLinkJson[];
          updated_at: string;
        };
        Insert: {
          id?: number;
          email?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          facebook?: string | null;
          instagram?: string | null;
          linkedin?: string | null;
          behance?: string | null;
          other_links?: SocialLinkJson[];
          updated_at?: string;
        };
        Update: {
          id?: number;
          email?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          facebook?: string | null;
          instagram?: string | null;
          linkedin?: string | null;
          behance?: string | null;
          other_links?: SocialLinkJson[];
          updated_at?: string;
        };
        Relationships: [];
      };
      website_settings: {
        Row: {
          id: number;
          website_title: string | null;
          website_description: string | null;
          logo_url: string | null;
          logo_public_id: string | null;
          favicon_url: string | null;
          favicon_public_id: string | null;
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          og_image_public_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          website_title?: string | null;
          website_description?: string | null;
          logo_url?: string | null;
          logo_public_id?: string | null;
          favicon_url?: string | null;
          favicon_public_id?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          og_image_public_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          website_title?: string | null;
          website_description?: string | null;
          logo_url?: string | null;
          logo_public_id?: string | null;
          favicon_url?: string | null;
          favicon_public_id?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          og_image_public_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      marquee_images: {
        Row: {
          id: string;
          image_url: string;
          cloudinary_public_id: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          cloudinary_public_id?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          cloudinary_public_id?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
