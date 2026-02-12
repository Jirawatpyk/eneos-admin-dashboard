# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ENEOS Admin Dashboard - Internal management dashboard for ENEOS Thailand sales team. Built with Next.js 16 App Router for executives to monitor KPIs, sales performance, and lead analytics.

**Tech Stack:**
- **Framework:** Next.js 16 (App Router, TypeScript strict mode)
- **Auth:** Supabase Auth (`@supabase/ssr`) — Email+Password + Google OAuth
- **Styling:** Tailwind CSS with ENEOS brand colors
- **Testing:** Vitest + React Testing Library
- **Port:** 3001 (Backend API runs on 3000)

## Common Commands

```bash
npm run dev          # Start dev server on port 3001
npm run build        # Production build
npm run lint         # ESLint check
npm test             # Run Vitest tests
npm run test:ui      # Vitest with UI
npm run test:coverage # Run tests with coverage report
```

## Architecture

### Route Groups
```
src/app/
├── (auth)/           # Public routes (login page)
│   └── login/
├── (dashboard)/      # Protected routes (requires auth)
│   ├── dashboard/
│   └── layout.tsx    # Dashboard layout with header
├── auth/callback/    # Supabase OAuth callback
└── layout.tsx        # Root layout with providers
```

### Authentication Flow (Supabase Auth)
1. `middleware.ts` - Route protection using Supabase session check
2. `src/lib/supabase/client.ts` - Browser Supabase client
3. `src/lib/supabase/server.ts` - Server-side Supabase client
4. `src/hooks/use-auth.ts` - Client hook for auth state (`useAuth()`)
5. `src/app/providers.tsx` - Root provider with `SupabaseAuthListener`
6. Login: Email+Password (`signInWithPassword`) or Google OAuth (`signInWithOAuth`)
7. Admin invite-only — self-signup disabled (enterprise security)

### Key Files
- `src/lib/supabase/client.ts` - Supabase browser client
- `src/lib/supabase/server.ts` - Supabase server client
- `src/hooks/use-auth.ts` - Auth hook (user, role, isAuthenticated)
- `src/middleware.ts` - Route protection
- `src/app/(dashboard)/layout.tsx` - Protected layout with session check
- `src/components/user-menu.tsx` - User dropdown with sign out

### Path Aliases
```typescript
import { createClient } from '@/lib/supabase/client';  // @/* maps to ./src/*
```

## Testing

Tests are in `src/__tests__/`:
- `setup.ts` - Global test setup (imports @testing-library/jest-dom)
- `middleware.test.ts` - Middleware tests
- `login.test.tsx` - Login page component tests
- `providers.test.tsx` - Provider tests

Vitest config uses jsdom environment with globals enabled.

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Brand Colors

ENEOS brand colors are configured in `tailwind.config.ts`:
```typescript
eneos: {
  red: "#E60012",       // Primary brand color
  "red-dark": "#C5000F",
  "red-light": "#FF1A2C",
}
```
Usage: `bg-eneos-red`, `text-eneos-red-dark`, etc.

## Related Documentation

Detailed specs in `docs/`:
- `CLAUDE-CONTEXT.md` - Comprehensive development context (status values, API endpoints, folder structure)
- `architecture.md` - System architecture diagrams
- `api-specification.md` - Backend API endpoint specs
- `PROGRESS.md` - Implementation progress tracking

## Backend Integration

This dashboard connects to a separate Express backend (see parent `eneos-sales-automation/` directory). Backend API endpoints:
- `GET /api/admin/dashboard` - KPIs summary
- `GET /api/admin/leads` - Lead list (paginated)
- `GET /api/admin/leads/:id` - Lead detail
- `GET /api/admin/sales-performance` - Team metrics
