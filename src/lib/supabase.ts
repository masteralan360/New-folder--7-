import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

// Create client even with empty values - it just won't work until configured
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// Check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
        // Simple query to test connection - just check if we can reach the database
        const { error } = await supabase.from('profiles').select('id').limit(1);
        // If we get a "relation does not exist" error, the connection works but table doesn't exist yet
        // That's still a valid connection
        if (error && !error.message.includes('does not exist')) {
            console.error('Database connection test failed:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Database connection error:', err);
        return false;
    }
}

export async function signInWithGoogle() {
    if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/dashboard`,
        },
    });
    if (error) throw error;
}

export async function signInWithGitHub() {
    if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${window.location.origin}/dashboard`,
        },
    });
    if (error) throw error;
}

export async function signInWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

export async function signUpWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

export async function updateEmail(newEmail: string) {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured.');
    }
    const { data, error } = await supabase.auth.updateUser({
        email: newEmail,
    });
    if (error) throw error;
    return data;
}

export async function updatePassword(newPassword: string) {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured.');
    }
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    });
    if (error) throw error;
    return data;
}

export async function signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
