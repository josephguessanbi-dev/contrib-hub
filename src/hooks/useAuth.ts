import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  nom: string;
  contacts?: string;
  numero_travail?: string;
  organisation_id: string;
}

interface UserRole {
  role: 'admin' | 'personnel';
  organisation_id: string;
}

interface AuthUser {
  user: User;
  profile: Profile;
  role: UserRole;
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Fetch user role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role, organisation_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!userRole) {
        throw new Error('User role not found');
      }

      return { profile, role: userRole };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user data when user is authenticated
          setTimeout(async () => {
            const userData = await fetchUserData(session.user.id);
            if (userData) {
              setAuthUser({
                user: session.user,
                profile: userData.profile,
                role: userData.role
              });
            }
            setLoading(false);
          }, 0);
        } else {
          setAuthUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id).then(userData => {
          if (userData) {
            setAuthUser({
              user: session.user,
              profile: userData.profile,
              role: userData.role
            });
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, nom: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nom
          }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setAuthUser(null);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    session,
    user,
    authUser,
    loading,
    signIn,
    signUp,
    signOut
  };
};