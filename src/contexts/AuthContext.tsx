import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthState, UserProfile, AuthResponse } from '../types/auth';
import { supabase } from '../lib/supabase';

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState(prev => ({ ...prev, session, isLoading: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setState(prev => ({ ...prev, session, isLoading: false }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Separate effect for profile management
  useEffect(() => {
    if (state.session?.user?.id && !state.user) {
      fetchUserProfile(state.session.user.id)
        .then(profile => {
          setState(prev => ({ ...prev, user: profile }));
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          setState(prev => ({ ...prev, error: error.message }));
        });
    }
  }, [state.session?.user?.id]);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      return { user: data.user, session: data.session };
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    try {
      const { data, error } = await supabase
        .from('userprofile')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no profile exists, create one with defaults
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('userprofile')
            .insert([{ user_id: userId }])
            .select()
            .single();

          if (createError) throw createError;
          return newProfile;
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, profile: Partial<UserProfile>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: profile.first_name,
            last_name: profile.last_name
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('userprofile')
          .insert([{
            user_id: authData.user.id,
            user_email: email,
            ...profile
          }]);
          
        if (profileError) throw profileError;
      }
    } catch (error: any) {
      console.error('Sign up error:', error); // Debug log
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('Signing out...'); // Debug log
      const { error } = await supabase.auth.signOut();
      console.log('Sign out response:', error); // Debug log

      if (error) throw error;
      setState(prev => ({ ...prev, user: null, session: null }));
    } catch (error: any) {
      console.error('Sign out error:', error); // Debug log
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('Resetting password...'); // Debug log
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      console.log('Reset password response:', error); // Debug log

      if (error) throw error;
    } catch (error: any) {
      console.error('Reset password error:', error); // Debug log
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('Updating profile...'); // Debug log
      if (!state.user?.user_id) throw new Error('No user logged in');

      const { error } = await supabase
        .from('userprofile')
        .update(profile)
        .eq('user_id', state.user.user_id);

      console.log('Update profile response:', error); // Debug log

      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...profile } : null
      }));
    } catch (error: any) {
      console.error('Update profile error:', error); // Debug log
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
