'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEMO_USER } from '@/lib/mock-data';

const AuthContext = createContext({
  user: null,
  profile: null,
  subscription: null,
  loading: true,
  isConfigured: false,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  resendVerification: async () => {},
  updatePassword: async () => {},
  updateProfile: async () => {},
  deleteAccount: async () => {},
  cancelSubscription: async () => {},
  updateSubscriptionPlan: async () => {},
});

const DEMO_SESSION_EVENT = 'saas-demo-session-change';

function subscribeToDemoSession(onChange) {
  window.addEventListener(DEMO_SESSION_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(DEMO_SESSION_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function getDemoSessionSnapshot() {
  return localStorage.getItem('saas_demo_user');
}

function getServerDemoSessionSnapshot() {
  return null;
}

function parseDemoUser(serializedUser) {
  if (!serializedUser) return null;
  try {
    return JSON.parse(serializedUser);
  } catch (error) {
    console.error('Could not restore the local demo session:', error);
    return null;
  }
}

function saveDemoUser(user) {
  localStorage.setItem('saas_demo_user', JSON.stringify(user));
  window.dispatchEvent(new Event(DEMO_SESSION_EVENT));
}

function clearDemoUser() {
  localStorage.removeItem('saas_demo_user');
  document.cookie = 'saas_demo_user=; path=/; max-age=0';
  window.dispatchEvent(new Event(DEMO_SESSION_EVENT));
}

export function AuthProvider({ children }) {
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [supabaseProfile, setSupabaseProfile] = useState(null);
  const [supabaseSubscription, setSupabaseSubscription] = useState(null);
  const [isConfigured] = useState(() => isSupabaseConfigured());
  const [loading, setLoading] = useState(() => isSupabaseConfigured());
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);
  const demoSession = useSyncExternalStore(
    subscribeToDemoSession,
    getDemoSessionSnapshot,
    getServerDemoSessionSnapshot
  );
  const demoUser = useMemo(() => parseDemoUser(demoSession), [demoSession]);
  const user = isConfigured ? supabaseUser : demoUser;
  const profile = isConfigured
    ? supabaseProfile
    : demoUser
      ? {
          id: demoUser.id,
          full_name: demoUser.user_metadata?.full_name || 'Alex Johnson',
          company_name: demoUser.user_metadata?.company_name || 'Acme Technologies',
        }
      : null;
  const subscription = isConfigured
    ? supabaseSubscription
    : demoUser?.subscription || null;

  useEffect(() => {
    if (!isConfigured) return undefined;

    // Real Supabase setup
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setSupabaseUser(user);

        if (user) {
          // Fetch profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileData) setSupabaseProfile(profileData);

          // Fetch subscription
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (subData) {
            setSupabaseSubscription(subData);
          } else {
            // Default free plan
            setSupabaseSubscription({
              plan_id: 'free',
              status: 'active',
              billing_interval: 'month',
              current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
            });
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    getUserData();

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setSupabaseUser(currentUser);
        if (!currentUser) {
          setSupabaseProfile(null);
          setSupabaseSubscription(null);
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [isConfigured, supabase]);

  const signIn = async ({ email, password }) => {
    if (!isConfigured) {
      // Demo authentication simulation
      const mockUser = {
        ...DEMO_USER,
        email: email || DEMO_USER.email,
      };
      saveDemoUser(mockUser);
      document.cookie = `saas_demo_user=${mockUser.id}; path=/; max-age=604800`;
      return { data: { user: mockUser }, error: null };
    }

    const res = await supabase.auth.signInWithPassword({ email, password });
    if (!res.error && res.data?.user) {
      router.refresh();
    }
    return res;
  };

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      return { error: { message: 'Connect Supabase and enable Google OAuth to use Google sign-in.' } };
    }

    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signUp = async ({ email, password, fullName }) => {
    if (!isConfigured) {
      const mockUser = {
        ...DEMO_USER,
        email,
        user_metadata: {
          ...DEMO_USER.user_metadata,
          full_name: fullName || 'New Member',
          company_name: 'My Workspace',
        },
        subscription: {
          plan_id: 'free',
          status: 'active',
          billing_interval: 'month',
          current_period_end: null,
          cancel_at_period_end: false,
        },
      };
      saveDemoUser(mockUser);
      document.cookie = `saas_demo_user=${mockUser.id}; path=/; max-age=604800`;
      return { data: { user: mockUser }, error: null };
    }

    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    if (!isConfigured) {
      clearDemoUser();
      router.push('/login');
      return { error: null };
    }

    const res = await supabase.auth.signOut();
    setSupabaseUser(null);
    setSupabaseProfile(null);
    setSupabaseSubscription(null);
    router.push('/login');
    router.refresh();
    return res;
  };

  const resetPassword = async (email) => {
    if (!isConfigured) {
      return { error: { message: 'Password reset requires a configured Supabase project.' } };
    }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  const resendVerification = async (email) => {
    if (!isConfigured) {
      return { error: { message: 'Email verification requires a configured Supabase project.' } };
    }

    return await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const updatePassword = async (newPassword) => {
    if (!isConfigured) {
      return { error: { message: 'Password changes require a configured Supabase project.' } };
    }
    return await supabase.auth.updateUser({ password: newPassword });
  };

  const updateProfile = async (updates) => {
    if (!isConfigured) {
      if (!demoUser) return { error: { message: 'Not authenticated' } };
      const updatedUser = {
        ...demoUser,
        user_metadata: {
          ...demoUser.user_metadata,
          full_name: updates.full_name || demoUser.user_metadata?.full_name,
          company_name: updates.company_name || demoUser.user_metadata?.company_name,
        },
      };
      saveDemoUser(updatedUser);
      return { error: null };
    }

    if (!user) return { error: { message: 'Not authenticated' } };

    return await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  };

  const deleteAccount = async () => {
    if (!isConfigured) {
      clearDemoUser();
      router.replace('/');
      return { error: null };
    }

    if (!user) return { error: { message: 'Not authenticated' } };

    const response = await fetch('/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });
    const result = await response.json();

    if (!response.ok) {
      return { error: { message: result.error || 'Account deletion failed.' } };
    }

    setSupabaseUser(null);
    setSupabaseProfile(null);
    setSupabaseSubscription(null);
    router.replace('/');
    router.refresh();
    return { error: null };
  };

  const requestBillingAction = async (payload) => {
    const response = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      return { error: { message: result.error || 'Billing request failed.' } };
    }

    return { data: result };
  };

  const cancelSubscription = async () => {
    if (!isConfigured) {
      return { error: { message: 'Payments are not configured.' } };
    }

    if (!user) return { error: { message: 'Not authenticated' } };

    return await requestBillingAction({ action: 'cancel' });
  };

  const updateSubscriptionPlan = async (planId, billingInterval = 'month') => {
    if (!isConfigured) {
      return { error: { message: 'Payments are not configured.' } };
    }

    if (!user) return { error: { message: 'Not authenticated' } };

    return await requestBillingAction({
      action: 'change_plan',
      planId,
      billingInterval,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        loading,
        isConfigured,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        resetPassword,
        resendVerification,
        updatePassword,
        updateProfile,
        deleteAccount,
        cancelSubscription,
        updateSubscriptionPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
