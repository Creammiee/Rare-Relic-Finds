-- Developer Dashboard Migration
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Ads System
CREATE TABLE IF NOT EXISTS ads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text,
  link_url text,
  ad_type text NOT NULL CHECK (ad_type IN ('banner', 'sidebar', 'feed', 'popup', 'sponsored')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'expired', 'archived')),
  target_roles text[] DEFAULT '{}',
  target_routes text[] DEFAULT '{}',
  priority integer DEFAULT 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Feature Toggles / System Modules
CREATE TABLE IF NOT EXISTS feature_toggles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  enabled boolean DEFAULT true,
  target_roles text[] DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. System Settings (key-value store)
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Insert default feature toggles
INSERT INTO feature_toggles (key, label, description, enabled) VALUES
  ('marketplace', 'Marketplace', 'Product listings and purchases', true),
  ('messaging', 'Messaging', 'User-to-user messaging system', true),
  ('wishlist', 'Wishlist', 'Save items to wishlist', true),
  ('reviews', 'Reviews', 'Product reviews and ratings', true),
  ('ads', 'Ads Engine', 'Display ads across the platform', false),
  ('notifications', 'Notifications', 'Push and in-app notifications', true),
  ('seller_registration', 'Seller Registration', 'Allow new seller signups', true)
ON CONFLICT (key) DO NOTHING;
