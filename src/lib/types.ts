export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Link {
    id: string;
    user_id: string;
    title: string;
    url: string;
    icon: string | null;
    position: number;
    is_active: boolean;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface CreateLinkInput {
    title: string;
    url: string;
    icon?: string;
    is_active?: boolean;
}

export interface UpdateLinkInput {
    id: string;
    title?: string;
    url?: string;
    icon?: string;
    position?: number;
    is_active?: boolean;
}

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
            };
            links: {
                Row: Link;
                Insert: Omit<Link, 'id' | 'created_at' | 'updated_at' | 'position'>;
                Update: Partial<Omit<Link, 'id' | 'user_id' | 'created_at'>>;
            };
        };
    };
};
