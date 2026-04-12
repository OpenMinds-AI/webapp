
-- Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'talent' CHECK (role IN ('talent', 'partner', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Talent profiles
CREATE TABLE public.talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  photo_url TEXT,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  linkedin TEXT,
  availability BOOLEAN NOT NULL DEFAULT true,
  badge_level TEXT NOT NULL DEFAULT 'apprentice' CHECK (badge_level IN ('apprentice', 'builder', 'architect', 'legend')),
  reputation_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talent can read own profile" ON public.talent_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Talent can insert own profile" ON public.talent_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talent can update own profile" ON public.talent_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill)
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own skills" ON public.skills
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" ON public.skills
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills" ON public.skills
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Requests (project/gig postings)
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  budget_range TEXT,
  skills_needed TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read open requests" ON public.requests
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Partners can insert requests" ON public.requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = partner_id);

CREATE POLICY "Partners can update own requests" ON public.requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = partner_id);

-- Partners
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can read own profile" ON public.partners
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Partners can insert own profile" ON public.partners
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can update own profile" ON public.partners
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own badges" ON public.badges
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');
