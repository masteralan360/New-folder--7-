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

> ✅ **Connection Check**: When you run the app, the home page will show a green badge saying "You are Connected to the Database" if everything is configured correctly.

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
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Links policies
CREATE POLICY "Public can view active links" 
  ON public.links FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can view own links" 
  ON public.links FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" 
  ON public.links FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" 
  ON public.links FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" 
  ON public.links FOR DELETE 
  USING (auth.uid() = user_id);
```

## 4. Enable Email/Password Authentication

Email/password auth is **enabled by default** in Supabase. No extra configuration needed!

### Create the Default Admin User

**Option 1: Manual Creation**
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - **Email**: `admin`
   - **Password**: `admin`
   - ✅ Check **Auto Confirm User** (skips email verification)
4. Click **Create User**

**Option 2: CSV Import**
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Import users from CSV**
3. Upload the `supabase_users.csv` file included in this project
4. The file contains:
   ```csv
   email,password
   admin,admin
   ```

> ⚠️ **Important**: Change this password after first login via the Settings page!

> 💡 **Note**: The login form accepts "admin" as both email and password without requiring email format or 6+ character validation.

### Email Confirmation (Optional)

By default, Supabase requires email confirmation. To disable for testing:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle OFF **Confirm Email**

For production, keep email confirmation ON.

## 5. Configure OAuth Providers (Optional)

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
7. Copy the **Client ID** and **Client Secret**
8. In Supabase, go to **Authentication** → **Providers** → **Google**
9. Enable Google and paste your credentials

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - Application name: `LinkBio`
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
4. Copy the **Client ID** and **Client Secret**
5. In Supabase, go to **Authentication** → **Providers** → **GitHub**
6. Enable GitHub and paste your credentials

## 6. Configure Site URL

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production URL (e.g., `https://your-app.vercel.app`)
3. Add **Redirect URLs**:
   - `http://localhost:5173/**` (for local development)
   - `https://your-app.vercel.app/**` (for production)

## 7. Run the App Locally

```bash
# Copy env example if you haven't
cp .env.example .env

# Edit .env with your Supabase credentials
# Then start the dev server
npm run dev
```

## 8. Default Login Credentials

The app comes with a pre-filled login form:

| Field | Value |
|-------|-------|
| Email | `admin@linkbio.local` |
| Password | `admin` |

After logging in, go to **Settings** to change your email and password.

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check that variables start with `VITE_`
- Restart the dev server after adding variables

### "Invalid login credentials"
- Make sure you created the admin user in Supabase
- Check that **Auto Confirm User** was enabled
- Verify the email/password match exactly

### OAuth redirects to wrong URL
- Check **Site URL** in Supabase Auth settings
- Verify redirect URLs include your domain with `/**`

## Security Notes

- Never expose the `service_role` key in the frontend
- The `anon` key is safe to use client-side with RLS enabled
- Change the default admin password after first login!
- All sensitive operations are protected by Row Level Security
