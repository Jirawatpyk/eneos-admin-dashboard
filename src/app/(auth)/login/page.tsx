'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const signedOut = searchParams.get('signedOut');
  const currentYear = new Date().getFullYear();

  // Initialize state based on URL params
  const shouldShowMessage = signedOut === 'true' && !error;
  const [showSignedOutMessage, setShowSignedOutMessage] = useState(shouldShowMessage);

  // Handle signed out message with auto-dismiss (AC6)
  useEffect(() => {
    if (shouldShowMessage) {
      setShowSignedOutMessage(true);
      // Clean URL immediately
      router.replace('/login', { scroll: false });
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setShowSignedOutMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowMessage, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'AccessDenied':
        return 'Access denied. Only authorized company accounts are allowed.';
      case 'OAuthCallback':
        return 'Authentication failed. Please try again.';
      case 'SessionExpired':
        return 'Your session has expired. Please log in again.';
      default:
        return errorCode ? 'An error occurred during sign in.' : null;
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
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
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Sales Dashboard
        </h1>

        {/* Domain Restriction Message */}
        <p className="text-sm text-gray-500 text-center mb-6">
          Only authorized company accounts are allowed
        </p>

        {/* Success Message - Signed Out (AC6) */}
        {showSignedOutMessage && (
          <div
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm"
            data-testid="signedout-message"
            role="status"
          >
            You have been signed out successfully.
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

        {/* Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
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
      <p className="mt-8 text-sm text-gray-400">
        &copy; {currentYear} ENEOS Thailand
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6 mx-auto w-32" />
          <div className="h-8 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-6 w-3/4 mx-auto" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
