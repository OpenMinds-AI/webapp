# Supabase Setup Instructions

## 1. Environment Variables

Add these to your `.env` file (or Lovable secrets):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Run the Schema

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Run the entire script

## 3. Storage Setup

1. Go to Storage in Supabase Dashboard
2. Create a new bucket called `avatars`
3. Set it to **Public**
4. Add a policy: Allow authenticated users to upload to their own path

## 4. Auth Setup

1. Go to Authentication → Providers
2. Make sure **Email** is enabled
3. Under Email settings, enable **Magic Link** login
4. Disable email confirmations if you want instant access (or keep for production)

## 5. Admin Setup

After creating the tables, insert admin roles manually:

```sql
-- Replace with actual user IDs after they sign up
INSERT INTO public.user_roles (user_id, role) VALUES
  ('victoria-user-id', 'admin'),
  ('jeremiah-user-id', 'admin'),
  ('praj-user-id', 'admin');
```
