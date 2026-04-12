
-- 1. Fix users UPDATE policy to explicitly prevent role/status changes
DROP POLICY IF EXISTS "Users can update own record safely" ON public.users;
CREATE POLICY "Users can update own record safely" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()) AND status = (SELECT status FROM public.users WHERE id = auth.uid()));

-- 2. Fix avatar INSERT policy to enforce path ownership
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload own avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Add avatar DELETE policy
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Fix requests INSERT to verify partner exists
DROP POLICY IF EXISTS "Partners can insert requests" ON public.requests;

CREATE OR REPLACE FUNCTION public.is_partner(_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.partners WHERE user_id = _user_id);
$$;

CREATE POLICY "Verified partners can insert requests" ON public.requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = partner_id AND public.is_partner(auth.uid()));

-- 5. Allow partners to browse available talent profiles
CREATE POLICY "Partners can browse available talent" ON public.talent_profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (availability = true AND public.is_partner(auth.uid()))
  );

-- Drop the old self-only SELECT policy since the new one covers both cases
DROP POLICY IF EXISTS "Talent can read own profile" ON public.talent_profiles;
