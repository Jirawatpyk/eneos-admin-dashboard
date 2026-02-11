'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const urlError = searchParams.get('error');
  const urlMessage = searchParams.get('message');
  const signedOut = searchParams.get('signedOut');

  // Initialize state based on URL params
  const shouldShowSignedOut = signedOut === 'true' && !urlError;
  const [showSignedOutMessage, setShowSignedOutMessage] = useState(shouldShowSignedOut);

  // Handle URL-based messages
  useEffect(() => {
    if (urlError === 'auth_error') {
      setErrorMessage('Login failed. Please try again or contact your admin.');
    }
  }, [urlError]);

  // Show password updated message
  const showPasswordUpdated = urlMessage === 'password_updated';

  // Handle signed out message with auto-dismiss
  useEffect(() => {
    if (shouldShowSignedOut) {
      setShowSignedOutMessage(true);
      router.replace('/login', { scroll: false });
      const timer = setTimeout(() => {
        setShowSignedOutMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowSignedOut, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Account not found. Contact your admin.');
        } else {
          setErrorMessage('Account not found. Contact your admin.');
        }
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setErrorMessage('Login failed. Please try again or contact your admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage('Login failed. Please try again or contact your admin.');
      }
    } catch {
      setErrorMessage('Login failed. Please try again or contact your admin.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const anyLoading = isLoading || isGoogleLoading;

  return (
    <>
      <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* ENEOS Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/eneos-logo.svg"
            alt="ENEOS Logo"
            width={120}
            height={120}
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
          Sales Dashboard
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground text-center mb-6">
          Sign in to your account
        </p>

        {/* Success Message - Signed Out */}
        {showSignedOutMessage && (
          <div
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm"
            data-testid="signedout-message"
            role="status"
          >
            You have been signed out successfully.
          </div>
        )}

        {/* Success Message - Password Updated */}
        {showPasswordUpdated && (
          <div
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm"
            data-testid="password-updated-message"
            role="status"
          >
            Password updated. Please log in.
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm"
            data-testid="error-message"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {/* Email + Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              disabled={anyLoading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-eneos-red focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="email-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={anyLoading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-eneos-red focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="password-input"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-sm text-eneos-red hover:underline"
              data-testid="forgot-password-link"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={anyLoading}
            className="w-full flex items-center justify-center gap-2 bg-eneos-red text-white rounded-lg px-4 py-3 font-medium hover:bg-eneos-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eneos-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="signin-button"
          >
            {isLoading ? (
              <>
                <Spinner />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">or</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={anyLoading}
          className="w-full flex items-center justify-center gap-3 bg-card border border-border rounded-lg px-4 py-3 text-foreground font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eneos-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="google-signin-button"
        >
          {isGoogleLoading ? (
            <>
              <Spinner className="h-5 w-5 text-muted-foreground" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        &copy; {currentYear} ENEOS Thailand
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md animate-pulse">
          <div className="h-12 bg-muted rounded mb-6 mx-auto w-32" />
          <div className="h-8 bg-muted rounded mb-2" />
          <div className="h-4 bg-muted rounded mb-6 w-3/4 mx-auto" />
          <div className="h-12 bg-muted rounded mb-4" />
          <div className="h-12 bg-muted rounded" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
