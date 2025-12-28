import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Link, CreateLinkInput, UpdateLinkInput } from '@/lib/types';
import { useAuth } from './useAuth';

// Fetch all links for the current user
export function useLinks() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['links', user?.id],
        queryFn: async (): Promise<Link[]> => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', user.id)
                .order('position', { ascending: true });

            if (error) throw error;
            return (data as Link[]) ?? [];
        },
        enabled: !!user,
    });
}

// Fetch public links for a specific username
export function usePublicLinks(username: string) {
    return useQuery({
        queryKey: ['public-links', username],
        queryFn: async (): Promise<{ profile: { display_name: string; bio: string | null; avatar_url: string | null } | null; links: Link[] }> => {
            // First get the user profile by username
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, display_name, bio, avatar_url')
                .eq('username', username)
                .single();

            if (profileError) throw profileError;
            if (!profile) return { profile: null, links: [] };

            // Then get their active links
            const { data: links, error: linksError } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', profile.id)
                .eq('is_active', true)
                .order('position', { ascending: true });

            if (linksError) throw linksError;

            return {
                profile: {
                    display_name: profile.display_name as string,
                    bio: profile.bio as string | null,
                    avatar_url: profile.avatar_url as string | null,
                },
                links: (links as Link[]) ?? [],
            };
        },
        enabled: !!username,
    });
}

// Create a new link
export function useCreateLink() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (input: CreateLinkInput): Promise<Link> => {
            if (!user) throw new Error('User not authenticated');

            // Get the current max position
            const { data: existingLinks } = await supabase
                .from('links')
                .select('position')
                .eq('user_id', user.id)
                .order('position', { ascending: false })
                .limit(1);

            const maxPosition = (existingLinks as { position: number }[] | null)?.[0]?.position ?? -1;

            const { data, error } = await supabase
                .from('links')
                .insert({
                    user_id: user.id,
                    title: input.title,
                    url: input.url,
                    icon: input.icon ?? null,
                    is_active: input.is_active ?? true,
                    position: maxPosition + 1,
                })
                .select()
                .single();

            if (error) throw error;
            return data as Link;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['links', user?.id] });
        },
    });
}

// Update an existing link
export function useUpdateLink() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (input: UpdateLinkInput): Promise<Link> => {
            if (!user) throw new Error('User not authenticated');

            const { id, ...updates } = input;

            const { data, error } = await supabase
                .from('links')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data as Link;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['links', user?.id] });
        },
    });
}

// Delete a link
export function useDeleteLink() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (linkId: string): Promise<void> => {
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('links')
                .delete()
                .eq('id', linkId)
                .eq('user_id', user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['links', user?.id] });
        },
    });
}

// Reorder links
export function useReorderLinks() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (orderedIds: string[]): Promise<void> => {
            if (!user) throw new Error('User not authenticated');

            // Update positions for all links one by one
            for (let index = 0; index < orderedIds.length; index++) {
                const { error } = await supabase
                    .from('links')
                    .update({ position: index, updated_at: new Date().toISOString() })
                    .eq('id', orderedIds[index])
                    .eq('user_id', user.id);

                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['links', user?.id] });
        },
    });
}
