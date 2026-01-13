import 'next-auth';
import 'next-auth/jwt';
import type { Role } from '../config/roles';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role; // Story 1.5: Role-based access control (AC#2)
    };
    // Note: accessToken intentionally NOT exposed to client for security
    expiresAt?: number; // Unix timestamp when session expires
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string; // Google ID token for Backend API authentication
    idTokenExpiresAt?: number; // Unix timestamp when Google ID token expires (~1 hour)
    expiresAt?: number; // Unix timestamp when session expires
    issuedAt?: number; // Unix timestamp when token was originally issued (never changes)
    lastRefreshedAt?: number; // Unix timestamp when token was last refreshed
    role?: Role; // Story 1.5: Role-based access control (AC#2)
    error?: string; // Error flag when token refresh fails
  }
}
