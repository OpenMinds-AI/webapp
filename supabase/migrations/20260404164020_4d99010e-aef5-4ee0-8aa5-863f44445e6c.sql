
-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = _user_id AND role = 'admin'
  )
$$;

CREATE TABLE public.talents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  community_code text UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  country text NOT NULL,
  timezone text,
  avatar_url text,
  primary_role text,
  skills text[] DEFAULT '{}',
  years_experience int DEFAULT 0,
  seniority text,
  availability text,
  engagement_type text,
  work_preference text,
  hourly_rate_range text,
  portfolio_url text,
  github_url text,
  projects jsonb DEFAULT '[]',
  proudest_build text,
  looking_for text[] DEFAULT '{}',
  willing_to_mentor boolean DEFAULT false,
  referral_source text,
  why_join text,
  linkedin_url text
);

ALTER TABLE public.talents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit application"
  ON public.talents FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own talent record"
  ON public.talents FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Approved talents can browse collective"
  ON public.talents FOR SELECT TO authenticated
  USING (
    status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.talents t
      WHERE t.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND t.status = 'approved'
    )
  );

CREATE POLICY "Admins can read all talents"
  ON public.talents FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update talent status"
  ON public.talents FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));
