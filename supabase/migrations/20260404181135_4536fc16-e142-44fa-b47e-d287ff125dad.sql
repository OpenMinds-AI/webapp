CREATE OR REPLACE FUNCTION public.generate_community_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_code text;
  next_num integer;
BEGIN
  SELECT community_code INTO max_code
  FROM public.talents
  WHERE community_code IS NOT NULL
  ORDER BY community_code DESC
  LIMIT 1;

  IF max_code IS NULL THEN
    next_num := 1;
  ELSE
    next_num := CAST(REPLACE(max_code, '#', '') AS integer) + 1;
  END IF;

  RETURN '#' || LPAD(next_num::text, 4, '0');
END;
$$;