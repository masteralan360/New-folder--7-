# Supabase Setup Guide

This guide explains how to set up Supabase for the LinkBio application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "linkbio")
5. Set a strong database password (save this!)
6. Select a region close to your users
7. Click "Create new project" and wait for initialization

## 2. Get Your API Credentials

1. Go to **Settings** → **API**
2. Copy the **Project URL** (e.g., `https://xxxxx.supabase.co`)
3. Copy the **anon/public** key (NOT the service role key!)
4. Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Set Up Database Tables

Go to **SQL Editor** and run the following migration:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create links table
CREATE TABLE public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  position INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_links_user_id ON public.links(user_id);
CREATE INDEX idx_links_position ON public.links(user_id, position);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Anyone can view profiles (for public profile pages)
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Links policies
-- Anyone can view active links (for public profile pages)
CREATE POLICY "Public can view active links" 
  ON public.links FOR SELECT 
  USING (is_active = true);

-- Authenticated users can view all their own links
CREATE POLICY "Users can view own links" 
  ON public.links FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own links
CREATE POLICY "Users can insert own links" 
  ON public.links FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own links
CREATE POLICY "Users can update own links" 
  ON public.links FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own links
CREATE POLICY "Users can delete own links" 
  ON public.links FOR DELETE 
  USING (auth.uid() = user_id);
```

## 4. Configure OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   (Replace `xxxxx` with your Supabase project ID)
7. Copy the **Client ID** and **Client Secret**
8. In Supabase, go to **Authentication** → **Providers** → **Google**
9. Enable Google and paste your credentials

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - Application name: `LinkBio`
   - Homepage URL: `https://your-domain.com` (or `http://localhost:5173` for dev)
   - Authorization callback URL:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
4. Copy the **Client ID** and **Client Secret**
5. In Supabase, go to **Authentication** → **Providers** → **GitHub**
6. Enable GitHub and paste your credentials

## 5. Configure Site URL

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production URL (e.g., `https://your-app.vercel.app`)
3. Add **Redirect URLs**:
   - `http://localhost:5173/**` (for local development)
   - `https://your-app.vercel.app/**` (for production)

## 6. Run the App Locally

```bash
# Copy env example if you haven't
cp .env.example .env

# Edit .env with your Supabase credentials
# Then start the dev server
npm run dev
```

## 7. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check that variables start with `VITE_`
- Restart the dev server after adding variables

### OAuth redirects to wrong URL
- Check **Site URL** in Supabase Auth settings
- Verify redirect URLs include your domain with `/**`
- Make sure OAuth callback URLs are correctly configured

### "User not found" or RLS errors
- Profile must be created before adding links
- Check that RLS policies were applied correctly
- Verify the user is authenticated before making requests

## Security Notes

- Never expose the `service_role` key in the frontend
- The `anon` key is safe to use client-side with RLS enabled
- All sensitive operations are protected by Row Level Security
- Users can only access their own data
