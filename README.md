# LinkBio - Personal Link-in-Bio App

A modern, private link-in-bio web application built with React, Vite, and Supabase.

![LinkBio](https://via.placeholder.com/800x400?text=LinkBio+Preview)

## Features

- 🔐 **Private & Secure** - OAuth authentication (Google & GitHub)
- 🔗 **Link Management** - Create, edit, delete, and reorder links
- 👤 **Public Profile** - Share your links via `yoursite.com/username`
- 🎨 **Modern UI** - Dark theme with glassmorphism effects
- ⚡ **Fast** - Static frontend deployable to Vercel

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Data**: React Query, Supabase
- **Forms**: React Hook Form, Zod
- **Routing**: Wouter
- **Icons**: Lucide React

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd linkbio
npm install
```

### 2. Set Up Supabase

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete instructions.

**Quick version:**
1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migrations from SUPABASE_SETUP.md
3. Enable Google and GitHub OAuth providers
4. Copy your credentials

### 3. Configure Environment

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── layout/       # Layout components
├── pages/
│   ├── Home.tsx      # Landing page
│   ├── Login.tsx     # OAuth login
│   ├── Dashboard.tsx # Link management
│   └── Profile.tsx   # Public profile
├── hooks/            # React hooks
├── lib/              # Utilities and config
└── App.tsx           # Main app with routing
```

## Security

- Row Level Security (RLS) ensures users can only access their own data
- OAuth authentication via Supabase Auth
- Anon key is safe for client-side use with RLS enabled

## License

MIT
