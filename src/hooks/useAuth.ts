import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isProvider: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isProvider: false,
    isAdmin: false,
  });

  const checkUserRoles = useCallback(async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const isProvider = roles?.some(r => r.role === 'provider') || !!provider;
      const isAdmin = roles?.some(r => r.role === 'admin') || false;

      return { isProvider, isAdmin };
    } catch (error) {
      console.error('Error checking roles:', error);
      return { isProvider: false, isAdmin: false };
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const roles = await checkUserRoles(session.user.id);
          setAuthState({
            user: session.user,
            session,
            loading: false,
            ...roles,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isProvider: false,
            isAdmin: false,
          });
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const roles = await checkUserRoles(session.user.id);
        setAuthState({
          user: session.user,
          session,
          loading: false,
          ...roles,
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          isProvider: false,
          isAdmin: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserRoles]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
}
