import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

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

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      // Note: hd param removed to support multiple domains (dev + production)
      // Domain restriction is enforced in signIn callback instead
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
        token.id = user.id;
        token.issuedAt = now; // Original login time - never changes
        token.lastRefreshedAt = now; // Tracks last refresh
        token.expiresAt = now + SESSION_MAX_AGE;
        return token;
      }

      // Subsequent calls - check if token needs refresh
      if (token.expiresAt) {
        const timeUntilExpiry = token.expiresAt - now;

        // If within refresh window (last 6 hours) and not expired, refresh the token
        if (timeUntilExpiry > 0 && timeUntilExpiry <= REFRESH_WINDOW) {
          token.expiresAt = now + SESSION_MAX_AGE;
          token.lastRefreshedAt = now; // Update refresh time, keep original issuedAt
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      // Expose user data and expiry to client
      // Note: accessToken is intentionally NOT exposed to client for security
      // It remains in the JWT cookie for server-side use only
      if (session.user) {
        session.user.id = token.id as string;
        session.expiresAt = token.expiresAt;
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
