import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { ROLES } from '../config/roles';
import type { JWT } from 'next-auth/jwt';

// Backend API URL for fetching user role
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Validate required environment variables at module load
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
} as const;

// Only validate at runtime (not during build or test)
const isRuntime =
  process.env.NODE_ENV !== 'test' &&
  process.env.NEXT_PHASE !== 'phase-production-build';

if (isRuntime) {
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

// Parse allowed domains from environment variable
// Default to eneos.co.th for production safety
const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS || 'eneos.co.th')
  .split(',')
  .map((domain) => domain.trim().toLowerCase());

// Helper function to check if email domain is allowed
const isAllowedDomain = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
};

// Google ID tokens expire after ~1 hour, refresh 5 minutes before
const ID_TOKEN_REFRESH_BUFFER = 5 * 60; // 5 minutes in seconds

// Timeout for backend API calls during authentication (5 seconds)
const BACKEND_API_TIMEOUT = 5000;

/**
 * Fetch user role from Backend API (Single Source of Truth)
 * Role is stored in Google Sheets Sales_Team sheet
 *
 * @param idToken - Google ID token for authentication
 * @returns User role from backend, defaults to 'viewer' on error or timeout
 */
async function fetchRoleFromBackend(idToken: string | undefined): Promise<typeof ROLES[keyof typeof ROLES]> {
  // Guard: If no ID token, skip backend call and default to viewer
  if (!idToken || idToken === 'undefined') {
    console.warn('[Auth] No valid ID token - defaulting to viewer role');
    return ROLES.VIEWER;
  }

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_API_TIMEOUT);

    const response = await fetch(`${BACKEND_URL}/api/admin/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('[Auth] Failed to fetch role from backend:', response.status);
      return ROLES.VIEWER;
    }

    const data = await response.json();

    if (data.success && data.data?.role) {
      const role = data.data.role.toLowerCase();
      if (role === 'admin') {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Role fetched from backend:', role);
        }
        return ROLES.ADMIN;
      }
    }

    return ROLES.VIEWER;
  } catch (error) {
    // Check if it was a timeout
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[Auth] Backend API timeout - defaulting to viewer role');
    } else {
      console.error('[Auth] Error fetching role from backend:', error);
    }
    return ROLES.VIEWER;
  }
}

/**
 * Refresh Google ID token using refresh_token
 * Google ID tokens expire after ~1 hour, need to refresh before API calls fail
 */
async function refreshGoogleIdToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error('[Auth] Failed to refresh Google token:', refreshedTokens);
      throw new Error('Failed to refresh Google token');
    }

    console.log('[Auth] Google ID token refreshed successfully');

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token,
      // Update expiry: Google access tokens last 1 hour
      idTokenExpiresAt: Math.floor(Date.now() / 1000) + (refreshedTokens.expires_in || 3600),
      // Keep refresh token (Google doesn't always return a new one)
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('[Auth] Error refreshing Google token:', error);
    // Return token with error flag - will force re-login
    return {
      ...token,
      error: 'RefreshTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      // Note: hd param removed to support multiple domains (dev + production)
      // Domain restriction is enforced in signIn callback instead
      authorization: {
        params: {
          // Request offline access to get refresh_token
          access_type: 'offline',
          prompt: 'consent',
          // Request openid scope to get id_token
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      // Verify email domain is in allowed list
      // This is the primary security check for domain restriction
      if (!isAllowedDomain(user.email)) {
        console.warn(`Login rejected: ${user.email} - domain not allowed`);
        return false;
      }
      return true;
    },
    jwt: async ({ token, account, user }) => {
      const now = Math.floor(Date.now() / 1000);
      const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
      const REFRESH_WINDOW = 6 * 60 * 60; // Last 6 hours of session

      // Initial sign in - set all token data
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token; // Google ID token for Backend API
        token.idTokenExpiresAt = now + 3600; // Google ID tokens expire in ~1 hour
        token.id = user.id;
        token.issuedAt = now; // Original login time - never changes
        token.lastRefreshedAt = now; // Tracks last refresh
        token.expiresAt = now + SESSION_MAX_AGE;
        // Fetch role from Backend API (Single Source of Truth: Google Sheets)
        token.role = await fetchRoleFromBackend(account.id_token as string);
        return token;
      }

      // Check if Google ID token needs refresh (expires in ~1 hour)
      // Refresh 5 minutes before expiry to avoid API failures
      const idTokenExpiresAt = (token.idTokenExpiresAt as number) || 0;
      if (idTokenExpiresAt > 0 && now >= idTokenExpiresAt - ID_TOKEN_REFRESH_BUFFER) {
        console.log('[Auth] ID token expired or expiring soon, refreshing...');
        const refreshedToken = await refreshGoogleIdToken(token);

        // If refresh failed, token will have error flag
        if (refreshedToken.error) {
          console.error('[Auth] Token refresh failed, user needs to re-login');
          return refreshedToken;
        }

        token = refreshedToken;
      }

      // Session refresh - check if session needs extension
      if (token.expiresAt) {
        const timeUntilExpiry = (token.expiresAt as number) - now;

        // If within refresh window (last 6 hours) and not expired, refresh the session
        if (timeUntilExpiry > 0 && timeUntilExpiry <= REFRESH_WINDOW) {
          token.expiresAt = now + SESSION_MAX_AGE;
          token.lastRefreshedAt = now; // Update refresh time, keep original issuedAt
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      // Check if token has error (e.g., RefreshTokenError from failed refresh)
      // If so, expose error to client so it can handle re-login
      if (token.error) {
        console.warn('[Auth] Session has token error, user needs to re-login:', token.error);
        // Expose error to session - client should check this and redirect to login
        session.error = token.error as string;
      }

      // Expose user data and expiry to client
      // Note: accessToken is intentionally NOT exposed to client for security
      // It remains in the JWT cookie for server-side use only
      if (session.user) {
        session.user.id = token.id as string;
        session.expiresAt = token.expiresAt;
        // AC#2: Expose role to client, default to viewer for safety
        session.user.role = (token.role as typeof ROLES[keyof typeof ROLES]) || ROLES.VIEWER;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors to login page with error param
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
};
