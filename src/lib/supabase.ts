import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Use createBrowserClient for App Router compatibility and cookie syncing
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  due_date?: string;
  baby_name?: string;
  blood_type?: string;
  hospital_name?: string;
  doctor_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type PartnerInvitation = {
  id: string;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};

export type PartnerLink = {
  id: string;
  owner_id: string;
  partner_id: string;
  role: 'partner' | 'editor';
  created_at: string;
};

export type KickSession = {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  notes?: string;
  kick_count: number;
};

export type Kick = {
  id: string;
  session_id: string;
  user_id: string;
  kicked_at: string;
  intensity?: number;
};
