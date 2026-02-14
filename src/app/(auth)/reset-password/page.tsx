'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
    } catch {
      // Silently catch network errors — always show success to prevent email enumeration
    }

    // Always show success (prevent email enumeration)
    setIsSubmitted(true);
    setIsLoading(false);
  };

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
            unoptimized
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your email to receive a reset link
        </p>

        {isSubmitted ? (
          <div>
            <div
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 text-sm"
              data-testid="success-message"
              role="status"
            >
              Check your email for a reset link
            </div>
            <Link
              href="/login"
              className="block w-full text-center bg-eneos-red text-white rounded-lg px-4 py-3 font-medium hover:bg-eneos-red/90 transition-colors"
              data-testid="back-to-login-link"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isLoading}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-eneos-red focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="email-input"
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
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
                data-testid="back-to-login-link"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        &copy; {currentYear} ENEOS Thailand
      </p>
    </>
  );
}
