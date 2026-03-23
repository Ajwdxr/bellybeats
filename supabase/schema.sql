-- User Profiles & Partner Invitation Schema

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  due_date DATE,
  baby_name TEXT,
  blood_type TEXT,
  hospital_name TEXT,
  doctor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Partner invitations table
CREATE TABLE IF NOT EXISTS public.partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Partners table (active links)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'partner' CHECK (role IN ('partner', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, partner_id)
);

-- 4. Kicks table (individual kick logs)
CREATE TABLE IF NOT EXISTS public.kicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kicked_at TIMESTAMPTZ DEFAULT NOW(),
  intensity SMALLINT DEFAULT 3
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Partner Invitations
CREATE POLICY "Users can view invites they sent" ON public.partner_invitations
  FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can send invites" ON public.partner_invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

-- Partners
CREATE POLICY "Users can view their own partners" ON public.partners
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = partner_id);

-- Kicks
CREATE POLICY "Users can view their own kicks" ON public.kicks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kicks" ON public.kicks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Access to kick data for partners
CREATE POLICY "Partners can view kicks" ON public.kicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.partners WHERE owner_id = kicks.user_id AND partner_id = auth.uid())
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
