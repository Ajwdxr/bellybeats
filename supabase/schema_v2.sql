-- Supabase Database Schema V2 for BellyBeats
-- Features: Kick Sessions, Kick Intensity, Partner Live Reactions, Contractions (5-1-1 Rule), Hospital Checklist

-- 1. Alter kicks table to support intensity & session reference
ALTER TABLE public.kicks ADD COLUMN IF NOT EXISTS intensity SMALLINT DEFAULT 2; -- 1: Soft Flutter, 2: Medium Kick, 3: Strong Roll
ALTER TABLE public.kicks ADD COLUMN IF NOT EXISTS session_id UUID;

-- 2. Kick Sessions Table (Count-to-10 Sesi)
CREATE TABLE IF NOT EXISTS public.kick_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  total_kicks INT DEFAULT 10,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint to kicks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_kicks_session'
  ) THEN
    ALTER TABLE public.kicks 
    ADD CONSTRAINT fk_kicks_session 
    FOREIGN KEY (session_id) REFERENCES public.kick_sessions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Partner Realtime Reactions Table
CREATE TABLE IF NOT EXISTS public.partner_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'listen', 'music', 'pray')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contractions Table (Labor Contraction Timer)
CREATE TABLE IF NOT EXISTS public.contractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  intensity SMALLINT DEFAULT 2, -- 1: Mild, 2: Moderate, 3: Strong
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Hospital Checklist Table
CREATE TABLE IF NOT EXISTS public.hospital_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('mom', 'baby', 'partner')),
  item_name TEXT NOT NULL,
  is_packed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kick_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_checklist ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- kick_sessions policies
CREATE POLICY "Users can view own kick sessions" ON public.kick_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners can view kick sessions" ON public.kick_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.partners WHERE owner_id = kick_sessions.user_id AND partner_id = auth.uid())
  );

CREATE POLICY "Users can manage own kick sessions" ON public.kick_sessions
  FOR ALL USING (auth.uid() = user_id);

-- partner_reactions policies
CREATE POLICY "Users can view reactions sent or received" ON public.partner_reactions
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert reactions" ON public.partner_reactions
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- contractions policies
CREATE POLICY "Users can manage own contractions" ON public.contractions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Partners can view contractions" ON public.contractions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.partners WHERE owner_id = contractions.user_id AND partner_id = auth.uid())
  );

-- hospital_checklist policies
CREATE POLICY "Users can manage own checklist" ON public.hospital_checklist
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Partners can view and update checklist" ON public.hospital_checklist
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.partners WHERE (owner_id = hospital_checklist.user_id AND partner_id = auth.uid()) OR (partner_id = hospital_checklist.user_id AND owner_id = auth.uid()))
  );
