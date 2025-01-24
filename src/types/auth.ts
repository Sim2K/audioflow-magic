import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  coaching_style_preference: string | null;
  feedback_frequency: string | null;
  privacy_settings: any | null;
  is_active: boolean | null;
  last_logged_in: string | null;
  nick_name: string | null;
  user_email: string | null;
  induction_complete: boolean | null;
  country: string | null;
  city: string | null;
  age: number | null;
  gender: string | null;
  last_donation: string | null;
  admin: boolean | null;
  subscription_end_date: string | null;
  date_joined: string | null;
  timezone: string | null;
  language: string | null;
}

export interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

export interface AuthContextType {
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface PasswordValidation {
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  isValid: boolean;
}
