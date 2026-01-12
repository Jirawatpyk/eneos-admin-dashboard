import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
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
    expiresAt?: number; // Unix timestamp when token expires
    issuedAt?: number; // Unix timestamp when token was originally issued (never changes)
    lastRefreshedAt?: number; // Unix timestamp when token was last refreshed
  }
}
