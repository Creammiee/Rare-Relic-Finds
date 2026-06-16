-- Run this in your Supabase SQL Editor
-- This fixes the broken database schema that is causing your profile to be invisible!

-- 1. Add the missing full_name column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;

-- 2. Add the missing email column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 3. Force Supabase API to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- 4. Force your account to be a developer (bypassing RLS)
INSERT INTO public.profiles (id, email, full_name, role, status)
SELECT id, email, 'Timothy', 'developer', 'active'
FROM auth.users
WHERE email = 'timothyjaymarquez018@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'developer', full_name = 'Timothy';
