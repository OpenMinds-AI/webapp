
-- Fix 1: Drop overly permissive avatar update policy and replace with ownership check
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Fix 2: Drop overly permissive users update policy
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

-- Create a restricted update policy that only allows safe column updates
-- We use a security definer function to prevent role/status escalation
CREATE OR REPLACE FUNCTION public.update_user_safe(
  _user_id UUID,
  _email TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET email = COALESCE(_email, email)
  WHERE id = _user_id;
END;
$$;

-- Re-add a SELECT-only style update policy: users can update but only email
CREATE POLICY "Users can update own record safely" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Revoke direct column update on role and status using a trigger
CREATE OR REPLACE FUNCTION public.prevent_role_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Cannot modify role';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Cannot modify status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_no_role_status_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_status_change();
