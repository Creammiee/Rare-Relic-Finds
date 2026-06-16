-- Run this exactly as written in your Supabase SQL Editor
-- It will find your auth user ID by your email and upgrade your profile to developer.

UPDATE public.profiles
SET role = 'developer'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'timothyjaymarquez018@gmail.com'
);
