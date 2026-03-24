import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, type Profile, type PartnerInvitation, type PartnerLink } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProfileState {
  profile: Profile | null;
  partners: PartnerLink[];
  receivedInvitations: PartnerInvitation[];
  sentInvitations: PartnerInvitation[];
  loading: boolean;
  
  fetchProfile: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  
  invitePartner: (email: string) => Promise<string | void>;
  fetchInvitations: () => Promise<void>;
  fetchPartners: () => Promise<void>;
  updateInvitation: (inviteId: string, status: 'accepted' | 'declined') => Promise<void>;
  removePartner: (partnerId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      partners: [],
      receivedInvitations: [],
      sentInvitations: [],
      loading: false,

      fetchProfile: async () => {
        set({ loading: true });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          set({ profile: data as Profile });
        }
        set({ loading: false });
      },

      updateProfile: async (updates) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          toast.error('Failed to update profile');
        } else {
          set({ profile: data as Profile });
          toast.success('Profile updated');
        }
      },

      invitePartner: async (email) => {
        const { profile } = get();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('partner_invitations')
          .insert({
            inviter_id: user.id,
            invitee_email: email,
            status: 'pending'
          })
          .select()
          .single();

        if (error) {
          toast.error('Failed to register invitation');
        } else {
          // Attempt to send email via API
          try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || '';
            const inviteLink = `${baseUrl}/signup?invite=${data.id}&email=${encodeURIComponent(email)}`;
            
            await fetch('/api/invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                inviterName: profile?.full_name || 'Your Partner',
                inviteLink
              })
            });
            // We don't wait for response, it's fire-and-forget/optimistic as we added DB entry
          } catch (e) {
            console.warn('API call failed, only database entry was updated.');
          }

          toast.success(`Invite created for ${email}`);
          get().fetchInvitations();
          return data.id; 
        }
      },

      fetchInvitations: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Sent
        const { data: sent } = await supabase
          .from('partner_invitations')
          .select('*')
          .eq('inviter_id', user.id);

        // Received (need a way to filter by user's email)
        const { data: received } = await supabase
          .from('partner_invitations')
          .select('*')
          .eq('invitee_email', user.email);

        set({ 
          sentInvitations: (sent || []) as PartnerInvitation[],
          receivedInvitations: (received || []) as PartnerInvitation[]
        });
      },

      fetchPartners: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('partners')
          .select('*')
          .or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`);

        set({ partners: (data || []) as PartnerLink[] });
      },

      updateInvitation: async (inviteId, status) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (status === 'accepted') {
          // Get the invitation details to find the inviter
          const { data: invite } = await supabase
            .from('partner_invitations')
            .select('inviter_id')
            .eq('id', inviteId)
            .single();

          if (invite) {
            // Create the active partner link
            const { error: partnerError } = await supabase
              .from('partners')
              .insert({
                owner_id: invite.inviter_id,
                partner_id: user.id
              });
            
            if (partnerError) {
              console.error('Failed to create partner link:', partnerError);
              toast.error('Failed to finalize connection');
              return;
            }
          }
        }

        const { error } = await supabase
            .from('partner_invitations')
            .update({ status })
            .eq('id', inviteId);
        
        if (error) {
            toast.error(`Failed to ${status} invitation`);
        } else {
            toast.success(`Invitation ${status}`);
            get().fetchInvitations();
            if (status === 'accepted') get().fetchPartners();
        }
      },

      removePartner: async (partnerId) => {
        const { error } = await supabase
          .from('partners')
          .delete()
          .eq('id', partnerId);

        if (error) {
          toast.error('Failed to remove partner');
        } else {
          toast.success('Partner removed');
          get().fetchPartners();
        }
      }
    }),
    {
      name: 'baby-kick-profile',
      partialize: (state) => ({ profile: state.profile })
    }
  )
);
