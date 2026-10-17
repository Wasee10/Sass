'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  updateProfile as firebaseUpdateProfile,
  deleteUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { DEMO_USER } from '@/lib/mock-data';

const AuthContext = createContext({
  user: null,
  profile: null,
  subscription: null,
  loading: true,
  isConfigured: true,
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          if (typeof document !== 'undefined') {
            document.cookie = `saas_demo_user=${encodeURIComponent(firebaseUser.email || 'apex_user')}; path=/; max-age=604800; SameSite=Lax`;
            document.cookie = `stratum_user_session=active; path=/; max-age=604800; SameSite=Lax`;
          }
        } catch {
          // ignore cookie error
        }

        // Determine saved package immediately from localStorage
        let savedPlanId = 'pro-monthly';
        let savedPlanName = 'Professional';
        let savedPrice = 29;
        let savedInterval = 'month';

        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('stratum_chosen_package');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.id || parsed.planId) {
                savedPlanId = parsed.id || parsed.planId;
                savedPlanName = parsed.name || parsed.planName;
                savedPrice = parsed.price;
                savedInterval = parsed.interval || parsed.billingInterval || (savedPlanId.includes('yearly') ? 'year' : 'month');
              }
            }
          } catch {
            // ignore
          }
        }

        const isYearly = savedInterval === 'year' || savedPlanId.includes('yearly');
        const isEnterprise = savedPlanId.includes('enterprise');
        const isFree = savedPlanId === 'free';

        if (!savedPlanName) {
          savedPlanName = isEnterprise ? (isYearly ? 'Enterprise Annual' : 'Enterprise') : isFree ? 'Free Starter' : (isYearly ? 'Pro Yearly' : 'Professional');
        }
        if (savedPrice === undefined) {
          savedPrice = isFree ? 0 : isEnterprise ? (isYearly ? 990 : 99) : (isYearly ? 290 : 29);
        }

        const initialProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Stratum Developer',
          avatar_url: firebaseUser.photoURL || null,
          company_name: 'Stratum Systems Inc.',
          created_at: new Date().toISOString(),
        };

        const initialSub = {
          user_id: firebaseUser.uid,
          plan_id: savedPlanId,
          plan_name: savedPlanName,
          status: 'active',
          billing_interval: isFree ? 'forever' : isYearly ? 'year' : 'month',
          price: savedPrice,
          current_period_end: new Date(Date.now() + (isYearly ? 365 : 30) * 86400000).toISOString(),
          seats_allocated: isEnterprise ? 25 : isFree ? 1 : 8,
          seats_total: isEnterprise ? 100 : isFree ? 3 : 12,
          compute_pool: isEnterprise ? 99.9 : isFree ? 25.0 : 84.2,
          license_key: 'STR-2026-COMMERCIAL-98F4-88A',
        };

        // Instantly activate user session - ZERO latency
        setProfile(initialProfile);
        setSubscription(initialSub);
        setLoading(false);

        // Background non-blocking sync with Firestore (silent on offline)
        (async () => {
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 500)
            );
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await Promise.race([getDoc(userDocRef), timeoutPromise]);
            if (userSnap && userSnap.exists()) {
              setProfile((prev) => ({ ...prev, ...userSnap.data() }));
            }
          } catch {
            // Silently ignore if Firestore database is uninitialized or offline
          }

          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 500)
            );
            const subDocRef = doc(db, 'subscriptions', firebaseUser.uid);
            const subSnap = await Promise.race([getDoc(subDocRef), timeoutPromise]);
            if (subSnap && subSnap.exists()) {
              setSubscription((prev) => ({ ...prev, ...subSnap.data() }));
            }
          } catch {
            // Silently ignore
          }
        })();
      } else {
        // If demo user cookie exists, load demo state
        const hasDemoCookie = typeof document !== 'undefined' && document.cookie.includes('saas_demo_user');
        if (hasDemoCookie) {
          const demoPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces';
          
          let demoPlanId = 'pro-monthly';
          let demoPlanName = 'Professional';
          let demoPrice = 29;
          let demoInterval = 'month';

          if (typeof window !== 'undefined') {
            try {
              const stored = localStorage.getItem('stratum_chosen_package');
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.id || parsed.planId) {
                  demoPlanId = parsed.id || parsed.planId;
                  demoPlanName = parsed.name || parsed.planName;
                  demoPrice = parsed.price;
                  demoInterval = parsed.interval || parsed.billingInterval || (demoPlanId.includes('yearly') ? 'year' : 'month');
                }
              }
            } catch {
              // ignore
            }
          }

          const isDemoYearly = demoInterval === 'year' || demoPlanId.includes('yearly');
          const isDemoEnterprise = demoPlanId.includes('enterprise');
          const isDemoFree = demoPlanId === 'free';

          if (!demoPlanName) {
            demoPlanName = isDemoEnterprise
              ? (isDemoYearly ? 'Enterprise Annual' : 'Enterprise')
              : isDemoFree
              ? 'Free Starter'
              : (isDemoYearly ? 'Pro Yearly' : 'Professional');
          }
          if (demoPrice === undefined) {
            demoPrice = isDemoFree ? 0 : isDemoEnterprise ? (isDemoYearly ? 990 : 99) : (isDemoYearly ? 290 : 29);
          }

          setUser({
            uid: 'stratum_demo_user_id',
            email: 'alex@stratum.io',
            displayName: 'Alex Thorne',
            photoURL: demoPhoto,
          });
          setProfile({
            id: 'stratum_demo_user_id',
            email: 'alex@stratum.io',
            full_name: 'Alex Thorne',
            avatar_url: demoPhoto,
            company_name: 'Stratum Systems Inc.',
          });
          setSubscription({
            user_id: 'stratum_demo_user_id',
            plan_id: demoPlanId,
            plan_name: demoPlanName,
            status: 'active',
            billing_interval: isDemoFree ? 'forever' : isDemoYearly ? 'year' : 'month',
            price: demoPrice,
            current_period_end: new Date(Date.now() + (isDemoYearly ? 365 : 30) * 86400000).toISOString(),
            seats_allocated: isDemoEnterprise ? 25 : isDemoFree ? 1 : 8,
            seats_total: isDemoEnterprise ? 100 : isDemoFree ? 3 : 12,
            compute_pool: isDemoEnterprise ? 99.9 : isDemoFree ? 25.0 : 84.2,
            license_key: 'STR-2026-COMMERCIAL-98F4-88A',
          });
        } else {
          setUser(null);
          setProfile(null);
          setSubscription(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Quick Demo Login for instant previewing
  const loginAsDemo = (chosenPkg = null) => {
    const demoPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces';
    if (typeof document !== 'undefined') {
      document.cookie = 'saas_demo_user=alex%40stratum.io; path=/; max-age=604800; SameSite=Lax';
    }

    let pkgToApply = chosenPkg;
    if (!pkgToApply && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('stratum_chosen_package');
        if (stored) {
          pkgToApply = JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }

    let planId = pkgToApply?.id || pkgToApply?.planId || 'pro-monthly';
    let interval = pkgToApply?.interval || pkgToApply?.billingInterval || (planId.includes('yearly') ? 'year' : 'month');
    const isYearly = interval === 'year' || planId.includes('yearly');
    const isEnterprise = planId.includes('enterprise');
    const isFree = planId === 'free';

    const resolvedPlanId = isFree ? 'free' : isEnterprise ? (isYearly ? 'enterprise-yearly' : 'enterprise') : (isYearly ? 'pro-yearly' : 'pro-monthly');
    const resolvedPlanName = isFree ? 'Free Starter' : isEnterprise ? (isYearly ? 'Enterprise Annual' : 'Enterprise') : (isYearly ? 'Pro Yearly' : 'Professional');
    const resolvedPrice = isFree ? 0 : isEnterprise ? (isYearly ? 990 : 99) : (isYearly ? 290 : 29);
    const resolvedInterval = isFree ? 'forever' : isYearly ? 'year' : 'month';

    const subData = {
      user_id: 'stratum_demo_user_id',
      plan_id: resolvedPlanId,
      plan_name: resolvedPlanName,
      status: 'active',
      billing_interval: resolvedInterval,
      price: resolvedPrice,
      current_period_end: new Date(Date.now() + (isYearly ? 365 : 30) * 86400000).toISOString(),
      seats_allocated: isEnterprise ? 25 : isFree ? 1 : 8,
      seats_total: isEnterprise ? 100 : isFree ? 3 : 12,
      compute_pool: isEnterprise ? 99.9 : isFree ? 25.0 : 84.2,
      license_key: 'STR-2026-COMMERCIAL-98F4-88A',
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'stratum_chosen_package',
          JSON.stringify({
            id: resolvedPlanId,
            planId: resolvedPlanId,
            name: resolvedPlanName,
            planName: resolvedPlanName,
            price: resolvedPrice,
            interval: resolvedInterval,
            billingInterval: resolvedInterval,
          })
        );
        document.cookie = `stratum_chosen_plan=${resolvedPlanId}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `stratum_chosen_interval=${resolvedInterval}; path=/; max-age=2592000; SameSite=Lax`;
      } catch {
        // ignore
      }
    }

    setUser({
      uid: 'stratum_demo_user_id',
      email: 'alex@stratum.io',
      displayName: 'Alex Thorne',
      photoURL: demoPhoto,
    });
    setProfile({
      id: 'stratum_demo_user_id',
      email: 'alex@stratum.io',
      full_name: 'Alex Thorne',
      avatar_url: demoPhoto,
      company_name: 'Stratum Systems Inc.',
    });
    setSubscription(subData);
  };

  // Sign In with Email & Password
  const signIn = async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (typeof document !== 'undefined') {
        document.cookie = `saas_demo_user=${encodeURIComponent(userCredential.user.email || 'user')}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `stratum_user_session=active; path=/; max-age=604800; SameSite=Lax`;
      }
      return { data: { user: userCredential.user }, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message || 'Failed to sign in.' } };
    }
  };

  // Sign In with Google OAuth
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (typeof document !== 'undefined') {
        document.cookie = `saas_demo_user=${encodeURIComponent(result.user.email || 'user')}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `stratum_user_session=active; path=/; max-age=604800; SameSite=Lax`;
      }
      return { data: { user: result.user }, error: null };
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { data: null, error: { message: 'Sign-in popup was closed before completion.' } };
      }
      if (err.code === 'auth/popup-blocked') {
        return { data: null, error: { message: 'Sign-in popup was blocked by your browser. Please allow popups for localhost.' } };
      }
      return { data: null, error: { message: err.message || 'Google sign-in encountered an issue.' } };
    }
  };

  // Sign Up with Email, Password & Full Name
  const signUp = async ({ email, password, fullName }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (typeof document !== 'undefined') {
        document.cookie = `saas_demo_user=${encodeURIComponent(firebaseUser.email || 'user')}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `stratum_user_session=active; path=/; max-age=604800; SameSite=Lax`;
      }

      if (fullName) {
        await firebaseUpdateProfile(firebaseUser, { displayName: fullName });
      }

      // Initialize user document in Firestore asynchronously (non-blocking)
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        setDoc(userDocRef, {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          full_name: fullName || 'New Member',
          company_name: 'Stratum Systems Inc.',
          created_at: new Date().toISOString(),
        }, { merge: true }).catch(() => {});

        const subDocRef = doc(db, 'subscriptions', firebaseUser.uid);
        setDoc(subDocRef, {
          user_id: firebaseUser.uid,
          plan_id: 'pro-monthly',
          plan_name: 'Professional',
          status: 'active',
          billing_interval: 'month',
          price: 29,
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
          seats_allocated: 1,
          seats_total: 12,
          compute_pool: 10.0,
          license_key: 'STR-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-STD',
        }, { merge: true }).catch(() => {});
      } catch {
        // ignore firestore offline
      }

      return { data: { user: firebaseUser }, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message || 'Registration failed.' } };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'saas_demo_user=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'stratum_user_session=; path=/; max-age=0; SameSite=Lax';
      }
      await firebaseSignOut(auth);
      router.push('/login');
      return { error: null };
    } catch (err) {
      return { error: { message: err.message || 'Failed to sign out.' } };
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err) {
      return { error: { message: err.message || 'Password reset failed.' } };
    }
  };

  // Resend Verification
  const resendVerification = async () => {
    return { error: null };
  };

  // Update Password
  const updatePassword = async (newPassword) => {
    if (!auth.currentUser) return { error: { message: 'Not authenticated.' } };
    try {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      return { error: null };
    } catch (err) {
      return { error: { message: err.message || 'Password update failed.' } };
    }
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (!auth.currentUser) return { error: { message: 'Not authenticated.' } };
    try {
      if (updates.full_name) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: updates.full_name });
      }

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
          ...updates,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore update warning:', err);
      }

      setProfile((prev) => ({ ...prev, ...updates }));
      return { error: null };
    } catch (err) {
      return { error: { message: err.message || 'Profile update failed.' } };
    }
  };

  // Delete Account
  const deleteAccount = async () => {
    if (!auth.currentUser) return { error: { message: 'Not authenticated.' } };
    try {
      await deleteUser(auth.currentUser);
      router.replace('/');
      return { error: null };
    } catch (err) {
      return { error: { message: err.message || 'Failed to delete account.' } };
    }
  };

  // Cancel Subscription
  const cancelSubscription = async () => {
    if (!auth.currentUser) return { error: { message: 'Not authenticated.' } };
    try {
      const subDocRef = doc(db, 'subscriptions', auth.currentUser.uid);
      await updateDoc(subDocRef, {
        status: 'canceled',
        cancel_at_period_end: true,
      });
      setSubscription((prev) => ({ ...prev, status: 'canceled', cancel_at_period_end: true }));
      return { error: null };
    } catch (err) {
      return { error: { message: err.message || 'Cancellation failed.' } };
    }
  };

  // Update Subscription Plan
  const updateSubscriptionPlan = async (planId, billingInterval = 'month') => {
    const isYearly = billingInterval === 'year' || planId.includes('yearly');
    const isEnterprise = planId.includes('enterprise');
    const isFree = planId === 'free';

    let resolvedPlanId = planId;
    let planName = 'Professional';
    let price = 29;

    if (isFree) {
      resolvedPlanId = 'free';
      planName = 'Free Starter';
      price = 0;
    } else if (isEnterprise) {
      resolvedPlanId = isYearly ? 'enterprise-yearly' : 'enterprise';
      planName = isYearly ? 'Enterprise Annual' : 'Enterprise';
      price = isYearly ? 990 : 99;
    } else {
      resolvedPlanId = isYearly ? 'pro-yearly' : 'pro-monthly';
      planName = isYearly ? 'Pro Yearly' : 'Professional';
      price = isYearly ? 290 : 29;
    }

    const updates = {
      plan_id: resolvedPlanId,
      plan_name: planName,
      billing_interval: isFree ? 'forever' : isYearly ? 'year' : 'month',
      price,
      status: 'active',
      current_period_end: new Date(Date.now() + (isYearly ? 365 : 30) * 86400000).toISOString(),
      seats_allocated: isEnterprise ? 25 : isFree ? 1 : 8,
      seats_total: isEnterprise ? 100 : isFree ? 3 : 12,
      compute_pool: isEnterprise ? 99.9 : isFree ? 25.0 : 84.2,
      license_key: 'STR-2026-COMMERCIAL-98F4-88A',
    };

    // Immediate local state update
    setSubscription((prev) => ({ ...(prev || {}), ...updates }));

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'stratum_chosen_package',
          JSON.stringify({
            id: resolvedPlanId,
            planId: resolvedPlanId,
            name: planName,
            planName,
            price,
            interval: isFree ? 'forever' : isYearly ? 'year' : 'month',
            billingInterval: isFree ? 'forever' : isYearly ? 'year' : 'month',
          })
        );
      } catch {
        // ignore
      }
    }

    // Fire-and-forget Firestore update
    if (auth.currentUser) {
      try {
        const subDocRef = doc(db, 'subscriptions', auth.currentUser.uid);
        updateDoc(subDocRef, updates).catch(() => {});
      } catch {
        // ignore firestore offline
      }
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        loading,
        isConfigured: true,
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
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
