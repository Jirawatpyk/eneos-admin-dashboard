# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ENEOS Admin Dashboard - Internal management dashboard for ENEOS Thailand sales team. Built with Next.js 14 App Router for executives to monitor KPIs, sales performance, and lead analytics.

**Tech Stack:**
- **Framework:** Next.js 14 (App Router, TypeScript strict mode)
- **Auth:** NextAuth.js with Google OAuth (domain-restricted)
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

### Run Single Test File
```bash
npx vitest run src/__tests__/auth.test.ts
npx vitest src/__tests__/auth.test.ts --watch  # Watch mode
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
├── api/auth/         # NextAuth.js API routes
└── layout.tsx        # Root layout with providers
```

### Authentication Flow
1. `middleware.ts` - Route protection using NextAuth middleware
2. `src/lib/auth.ts` - NextAuth config with Google OAuth provider
3. Domain restriction via `ALLOWED_DOMAINS` env var (defaults to `eneos.co.th`)
4. Dashboard layout has defense-in-depth session check

### Key Files
- `src/lib/auth.ts` - NextAuth configuration, domain validation logic
- `src/middleware.ts` - Route protection (excludes `/login`, `/api/auth`)
- `src/app/(dashboard)/layout.tsx` - Protected layout with session check
- `src/components/user-menu.tsx` - User dropdown with sign out

### Path Aliases
```typescript
import { authOptions } from '@/lib/auth';  // @/* maps to ./src/*
```

## Testing

Tests are in `src/__tests__/`:
- `setup.ts` - Global test setup (imports @testing-library/jest-dom)
- `auth.test.ts` - Auth configuration tests
- `middleware.test.ts` - Middleware tests
- `login.test.tsx` - Login page component tests

Vitest config uses jsdom environment with globals enabled.

## Environment Variables

Required in `.env.local`:
```bash
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3001
ALLOWED_DOMAINS=eneos.co.th,example.com  # Comma-separated allowed email domains
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
