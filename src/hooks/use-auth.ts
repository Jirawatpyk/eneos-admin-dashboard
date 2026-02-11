'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { ROLES, type Role } from '@/config/roles';

export interface AuthState {
  user: User | null;
  role: Role;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  return {
    user,
    role: user?.app_metadata?.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.VIEWER,
    isLoading,
    isAuthenticated: !!user,
  };
}
