"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, Mail, Calendar, Settings, Bell, Shield, LogOut, 
  ChevronRight, Heart, Sparkles, Pencil, Camera, Phone,
  Stethoscope, Home, Droplets, Users, Send, Check, X, Trash2
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { format, differenceInWeeks, parseISO } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, initialized } = useAuthStore();
  const { 
    profile, loading, fetchProfile, updateProfile, 
    invitePartner, sentInvitations, receivedInvitations, fetchInvitations,
    partners, fetchPartners, removePartner, updateInvitation
  } = useProfileStore();
  
  const [editing, setEditing] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    due_date: "",
    baby_name: "",
    blood_type: "",
    hospital_name: "",
    doctor_name: ""
  });

  useEffect(() => {
    if (initialized && user) {
      fetchProfile();
      fetchInvitations();
      fetchPartners();
    }
  }, [initialized, user, fetchProfile, fetchInvitations, fetchPartners]);

  useEffect(() => {
    if (initialized && !user) {
      router.push("/");
    }
  }, [user, initialized, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        due_date: profile.due_date || "",
        baby_name: profile.baby_name || "",
        blood_type: profile.blood_type || "",
        hospital_name: profile.hospital_name || "",
        doctor_name: profile.doctor_name || ""
      });
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    // Hard reload to landing page is more robust for clearing sessions
    window.location.href = "/";
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateProfile(formData);
    setEditing(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerEmail.trim()) return;
    await invitePartner(partnerEmail);
    setPartnerEmail("");
  };

  const calculateWeek = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const dueDate = parseISO(dateStr);
      const conceptionDate = new Date(dueDate.getTime() - (280 * 24 * 60 * 60 * 1000));
      const weeks = differenceInWeeks(new Date(), conceptionDate);
      return Math.max(0, Math.min(42, weeks));
    } catch {
      return null;
    }
  };

  const pregnancyWeek = calculateWeek(formData.due_date);

  if (!initialized || !user) return null;

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
        <Button variant="ghost" size="icon" className="rounded-full glass hover:bg-white/10" onClick={() => setEditing(!editing)}>
          {editing ? <Check className="w-5 h-5 text-primary" /> : <Settings className="w-5 h-5 text-white/50" />}
        </Button>
      </header>

      {/* Profile Header Card */}
      <GlassCard className="p-8 relative overflow-hidden text-center flex flex-col items-center gap-6" glowColor="rgba(139, 92, 246, 0.2)">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-2 border-primary/50 shadow-2xl">
            <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {user?.email?.charAt(0).toUpperCase() || <User size={32} />}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-white/10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
           <h2 className="text-2xl font-bold text-white">{formData.full_name || "Mom-to-be"}</h2>
           <p className="text-white/40 text-sm">{user?.email}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {pregnancyWeek !== null && (
            <div className="px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_12px_rgba(236,72,153,0.1)]">
              <Heart className="w-3 h-3 fill-pink-400" />
              {pregnancyWeek} Weeks
            </div>
          )}
          {formData.blood_type && (
            <div className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_12px_rgba(239,68,68,0.1)]">
              <Droplets className="w-3 h-3 fill-red-400" />
              Type {formData.blood_type}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Information Form */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-semibold text-white/50 text-xs uppercase tracking-widest">Pregnancy Details</h3>
          {!editing && (
            <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-primary" onClick={() => setEditing(true)}>
              Edit Info
            </Button>
          )}
        </div>
        
        <GlassCard className="p-6 space-y-6" glowColor="rgba(255,255,255,0.02)">
          {editing ? (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label className="text-white/50 text-xs uppercase tracking-tight ml-1">Full Name</Label>
                 <Input 
                   className="glass border-white/5" 
                   value={formData.full_name} 
                   onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-white/50 text-xs uppercase tracking-tight ml-1">Phone Number</Label>
                 <Input 
                   type="tel"
                   className="glass border-white/5" 
                   value={formData.phone} 
                   onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-white/50 text-xs uppercase tracking-tight ml-1">Due Date</Label>
                 <Input 
                   type="date"
                   className="glass border-white/5" 
                   value={formData.due_date} 
                   onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-white/50 text-xs uppercase tracking-tight ml-1">Baby Name (Nickname)</Label>
                 <Input 
                   className="glass border-white/5" 
                   placeholder="Little One"
                   value={formData.baby_name} 
                   onChange={(e) => setFormData({...formData, baby_name: e.target.value})} 
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-white/50 text-xs uppercase tracking-tight ml-1">Blood Type</Label>
                 <Input 
                   className="glass border-white/5" 
                   placeholder="A+"
                   value={formData.blood_type} 
                   onChange={(e) => setFormData({...formData, blood_type: e.target.value})} 
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-white/50 text-xs uppercase tracking-tight ml-1">Hospital Name</Label>
                 <Input 
                   className="glass border-white/5" 
                   value={formData.hospital_name} 
                   onChange={(e) => setFormData({...formData, hospital_name: e.target.value})} 
                 />
              </div>
              <div className="space-y-2 md:col-span-2">
                 <Label className="text-white/50 text-xs uppercase tracking-tight ml-1">Doctor/OB-GYN Name</Label>
                 <Input 
                   className="glass border-white/5" 
                   value={formData.doctor_name} 
                   onChange={(e) => setFormData({...formData, doctor_name: e.target.value})} 
                 />
              </div>
              <div className="md:col-span-2 pt-2">
                <Button type="submit" className="w-full rounded-xl font-bold">Save All Changes</Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
              <ProfileItem icon={Phone} label="Phone" value={formData.phone || "Not set"} color="text-green-400" bgColor="bg-green-500/10" />
              <ProfileItem icon={Calendar} label="Due Date" value={formData.due_date ? format(parseISO(formData.due_date), "MMM dd, yyyy") : "Not set"} color="text-blue-400" bgColor="bg-blue-500/10" />
              <ProfileItem icon={Heart} label="Baby Name" value={formData.baby_name || "Not set"} color="text-pink-400" bgColor="bg-pink-500/10" />
              <ProfileItem icon={Stethoscope} label="Doctor" value={formData.doctor_name || "Not set"} color="text-purple-400" bgColor="bg-purple-500/10" />
              <ProfileItem icon={Home} label="Hospital" value={formData.hospital_name || "Not set"} color="text-orange-400" bgColor="bg-orange-500/10" iconSpan={2} />
            </div>
          )}
        </GlassCard>
      </div>

      {/* Partner Invitation & Received Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white/50 text-xs uppercase tracking-widest px-2">Partners & Access</h3>
        
        {/* Received Invites */}
        {receivedInvitations.length > 0 && (
          <GlassCard className="p-6 space-y-4 border-primary/30" glowColor="rgba(96, 165, 250, 0.2)">
            <Label className="text-[10px] uppercase tracking-widest text-primary font-bold">Action Required: Invites Received</Label>
            <div className="space-y-3">
              {receivedInvitations.filter(i => i.status === 'pending').map(invite => (
                <div key={invite.id} className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3">
                     <Users className="w-5 h-5 text-primary" />
                     <div>
                        <p className="text-sm font-bold text-white">Monitor Request</p>
                        <p className="text-xs text-white/40">From your partner</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 rounded-lg bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30" onClick={() => updateInvitation(invite.id, 'accepted')}>
                      Accept
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-white/30" onClick={() => updateInvitation(invite.id, 'declined')}>
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        <GlassCard className="p-6 space-y-6" glowColor="rgba(59, 130, 246, 0.1)">
          <div className="space-y-2">
            <h4 className="text-white font-bold">Invite Monitor</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              Invite your partner to monitor your baby's kick activity in real-time. They will receive read-only access to your dashboard.
            </p>
          </div>
          
          <form onSubmit={handleInvite} className="flex gap-2">
             <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <Input 
                  type="email"
                  placeholder="partner@example.com"
                  className="pl-10 glass border-white/5 h-11"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                />
             </div>
             <Button type="submit" className="h-11 rounded-xl px-6 font-bold flex items-center gap-2">
               Invite <Send className="w-4 h-4" />
             </Button>
          </form>

          {sentInvitations.length > 0 && (
            <div className="pt-4 space-y-3">
              <Label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Invitations Sent</Label>
              {sentInvitations.map(invite => (
                <div key={invite.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{invite.invitee_email}</p>
                      <p className="text-[10px] text-white/30 uppercase">{invite.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invite.status === 'pending' && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.5)]" />}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <Button 
          variant="ghost" 
          className="w-full h-12 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center justify-center gap-2 font-bold"
          onClick={handleSignOut}
        >
          <LogOut size={20} />
          Sign Out of BellyBeats
        </Button>
      </div>
      
      <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em] pt-4"> Version 1.1.0-alpha • BellyBeats </p>
    </div>
  );
}

function ProfileItem({ icon: Icon, label, value, color, bgColor, iconSpan = 1 }: any) {
  return (
    <div className={cn("space-y-2", iconSpan === 2 && "col-span-2")}>
       <div className="flex items-center gap-2">
         <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shadow-inner", bgColor, color)}>
           <Icon className="w-4 h-4" />
         </div>
         <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{label}</span>
       </div>
       <p className="text-white font-medium pl-9">{value}</p>
    </div>
  );
}
