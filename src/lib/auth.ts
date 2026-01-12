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

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          hd: 'eneos.co.th', // Domain restriction at OAuth level
        },
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      // Double-check domain even if hd param is bypassed
      if (!user.email?.endsWith('@eneos.co.th')) {
        return false;
      }
      return true;
    },
    jwt: async ({ token, account, user }) => {
      // Persist access token and user ID to JWT
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Expose user data to client
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
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
