'use client';

import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {user.image && (
        <Image
          src={user.image}
          alt={user.name || 'User'}
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <span className="text-sm text-gray-600">{user.name}</span>
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  );
}
