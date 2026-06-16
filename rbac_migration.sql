-- Run this SQL in your Supabase Dashboard -> SQL Editor

-- 1. Add status column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' 
CHECK (status IN ('active', 'suspended', 'banned'));

-- 2. Drop the existing role check constraint (it might have a different name in your DB, 
-- but usually it's `profiles_role_check`). If it fails, check your constraints in the table editor.
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Add the updated role check constraint including 'developer'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('developer', 'admin', 'seller', 'user'));

-- 4. Create the activity_logs table for audit logging
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. IMPORTANT: Assign yourself the developer role!
-- Replace 'YOUR_EMAIL@DOMAIN.COM' with your actual account email
UPDATE profiles 
SET role = 'developer' 
WHERE email = 'YOUR_EMAIL@DOMAIN.COM';
