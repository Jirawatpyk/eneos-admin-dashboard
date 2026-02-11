'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canUpdatePassword, setCanUpdatePassword] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const canUpdateRef = useRef(false);
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        canUpdateRef.current = true;
        setCanUpdatePassword(true);
      }
    });

    // Set a timeout for token validation
    const timeout = setTimeout(() => {
      if (!canUpdateRef.current) {
        setTokenError(true);
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    // Sign out after password update so user logs in with new password
    await supabase.auth.signOut();
    router.push('/login?message=password_updated');
  };

  // Token expired/invalid state
  if (tokenError && !canUpdatePassword) {
    return (
      <>
        <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Image src="/eneos-logo.svg" alt="ENEOS Logo" width={120} height={120} priority />
          </div>
          <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
            Invalid or Expired Link
          </h1>
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm"
            data-testid="token-error-message"
            role="alert"
          >
            This password reset link is invalid or has expired.
          </div>
          <Link
            href="/reset-password"
            className="block w-full text-center bg-eneos-red text-white rounded-lg px-4 py-3 font-medium hover:bg-eneos-red/90 transition-colors"
            data-testid="request-new-link"
          >
            Request new reset link
          </Link>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          &copy; {currentYear} ENEOS Thailand
        </p>
      </>
    );
  }

  // Waiting for PASSWORD_RECOVERY event
  if (!canUpdatePassword) {
    return (
      <>
        <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Image src="/eneos-logo.svg" alt="ENEOS Logo" width={120} height={120} priority />
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground" data-testid="verifying-spinner">
            <Spinner />
            <span>Verifying reset link...</span>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          &copy; {currentYear} ENEOS Thailand
        </p>
      </>
    );
  }

  return (
    <>
      <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* ENEOS Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/eneos-logo.svg" alt="ENEOS Logo" width={120} height={120} priority />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
          Update Password
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your new password
        </p>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-eneos-red focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="password-input"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              minLength={8}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-eneos-red focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="confirm-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-eneos-red text-white rounded-lg px-4 py-3 font-medium hover:bg-eneos-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eneos-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="submit-button"
          >
            {isLoading ? (
              <>
                <Spinner />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        &copy; {currentYear} ENEOS Thailand
      </p>
    </>
  );
}
