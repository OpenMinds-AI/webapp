-- OpenMinds AI Full Schema
-- Run this in your Supabase SQL Editor

-- 1. Enums
CREATE TYPE public.app_role AS ENUM ('talent', 'requester', 'partner', 'admin');
CREATE TYPE public.app_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.badge_level AS ENUM ('apprentice', 'builder', 'architect', 'legend');

-- 2. Users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL,
  community_code TEXT UNIQUE,
  status app_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. User Roles (for admin check - avoids RLS recursion)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'tech',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- 6. Talent Profiles
CREATE TABLE public.talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  photo_url TEXT,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  linkedin TEXT,
  availability BOOLEAN NOT NULL DEFAULT true,
  badge_level badge_level NOT NULL DEFAULT 'apprentice',
  reputation_score INT NOT NULL DEFAULT 0,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Talent Skills (junction)
CREATE TABLE public.talent_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  UNIQUE (talent_id, skill_id)
);
ALTER TABLE public.talent_skills ENABLE ROW LEVEL SECURITY;

-- 8. Requests
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  help_type TEXT NOT NULL,
  timeline TEXT,
  budget TEXT,
  status app_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- 9. Partners
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_description TEXT NOT NULL,
  partnership_type TEXT NOT NULL,
  reach TEXT,
  offer TEXT,
  success_definition TEXT,
  visible_in_grid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- 10. Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  awarded_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- 11. Community code auto-assignment function
CREATE OR REPLACE FUNCTION public.assign_community_code()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_code INT;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    SELECT COALESCE(MAX(CAST(REPLACE(community_code, '#', '') AS INT)), 0) + 1
    INTO next_code FROM public.users WHERE community_code IS NOT NULL;
    NEW.community_code := '#' || LPAD(next_code::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_assign_community_code
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_community_code();

-- ============ RLS POLICIES ============

-- Users: own row readable/writable, admins see all
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Talent Profiles: approved talents see approved, own always editable
CREATE POLICY "Own profile readable" ON public.talent_profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Own profile writable" ON public.talent_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own profile updatable" ON public.talent_profiles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Approved talents see approved profiles" ON public.talent_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND status = 'approved')
    AND EXISTS (SELECT 1 FROM public.users WHERE id = talent_profiles.user_id AND status = 'approved')
  );
CREATE POLICY "Admins see all profiles" ON public.talent_profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all profiles" ON public.talent_profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Skills: readable by all authenticated
CREATE POLICY "Authenticated can read skills" ON public.skills
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage skills" ON public.skills
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Talent Skills
CREATE POLICY "Own talent skills writable" ON public.talent_skills
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = talent_id AND user_id = auth.uid())
  );
CREATE POLICY "Talent skills readable with profile" ON public.talent_skills
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.talent_profiles tp
      JOIN public.users u ON u.id = tp.user_id
      WHERE tp.id = talent_id AND u.status = 'approved')
    OR EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = talent_id AND user_id = auth.uid())
  );

-- Requests: only own + admin
CREATE POLICY "Own requests readable" ON public.requests
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Own requests insertable" ON public.requests
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins see all requests" ON public.requests
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update requests" ON public.requests
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Partners: only own + admin
CREATE POLICY "Own partner readable" ON public.partners
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Own partner insertable" ON public.partners
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins see all partners" ON public.partners
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update partners" ON public.partners
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Badges: readable with profile, admin writable
CREATE POLICY "Badges readable" ON public.badges
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = talent_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins manage badges" ON public.badges
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User Roles: admin only
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Own roles readable" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- ============ SEED SKILLS ============
INSERT INTO public.skills (name, category, sort_order) VALUES
  ('AI/ML', 'tech', 1), ('Full-Stack', 'tech', 2), ('Frontend', 'tech', 3),
  ('Backend', 'tech', 4), ('Mobile', 'tech', 5), ('DevOps', 'tech', 6),
  ('Data Science', 'tech', 7), ('Blockchain', 'tech', 8), ('Cybersecurity', 'tech', 9),
  ('Cloud Architecture', 'tech', 10), ('API Development', 'tech', 11), ('Open Source', 'tech', 12),
  ('Product Management', 'non-tech', 13), ('UX/UI Design', 'non-tech', 14),
  ('Marketing', 'non-tech', 15), ('Growth', 'non-tech', 16), ('Finance', 'non-tech', 17),
  ('Operations', 'non-tech', 18), ('Community Building', 'non-tech', 19),
  ('Content Strategy', 'non-tech', 20);

-- ============ STORAGE ============
-- Create avatars bucket (run in Supabase dashboard > Storage if this fails)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
