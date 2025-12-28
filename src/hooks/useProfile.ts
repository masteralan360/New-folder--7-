import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import { useAuth } from './useAuth';

interface UpdateProfileInput {
    username?: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (input: UpdateProfileInput): Promise<Profile> => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('profiles')
                .update({ ...input, updated_at: new Date().toISOString() })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data as Profile;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

export function useCreateProfile() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (input: { username: string; display_name?: string }): Promise<Profile> => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    username: input.username,
                    display_name: input.display_name ?? user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
                    avatar_url: user.user_metadata?.avatar_url ?? null,
                })
                .select()
                .single();

            if (error) throw error;
            return data as Profile;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}
