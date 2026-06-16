-- Add Seller Application Status columns to Profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS seller_application_status TEXT CHECK (seller_application_status IN ('pending', 'approved', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain status
COMMENT ON COLUMN public.profiles.seller_application_status IS 'Tracks the state of a user applying to become a seller';

-- Reload schema cache so API can see new columns immediately
NOTIFY pgrst, 'reload schema';
