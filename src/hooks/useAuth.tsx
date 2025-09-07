import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
  organizationId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
          if (session?.user) {
            // Fetch user profile and role
            setTimeout(async () => {
              try {
                const { data: userData, error } = await supabase
                  .from('users')
                  .select('role, organization_id')
                  .eq('auth_user_id', session.user.id)
                  .maybeSingle();
                
                if (error) {
                  console.error('Error fetching user data:', error);
                  // Security fix: Don't automatically assign roles
                  setUserRole(null);
                  setOrganizationId(null);
                  return;
                }
                
                if (userData) {
                  setUserRole(userData.role);
                  setOrganizationId(userData.organization_id);
                } else {
                  // Security fix: User needs proper profile setup
                  console.warn('User authenticated but no profile found - requires proper onboarding');
                  setUserRole(null);
                  setOrganizationId(null);
                }
              } catch (err) {
                console.error('Exception fetching user data:', err);
                // Security fix: Don't fall back to automatic privileges
                setUserRole(null);
                setOrganizationId(null);
              }
            }, 0);
        } else {
          setUserRole(null);
          setOrganizationId(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    userRole,
    organizationId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}