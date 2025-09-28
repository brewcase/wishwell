-- 🗃️ CONCEPT: Database Schema for WishLoop
-- Run this SQL in your Supabase SQL Editor

-- 👤 PROFILES TABLE (User information)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  full_name VARCHAR GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
  phone VARCHAR,
  timezone VARCHAR DEFAULT 'America/New_York',
  reminder_preferences JSONB DEFAULT '{"voice_enabled": true, "email_enabled": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎂 FRIENDS TABLE (Birthday data)
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  birthday DATE NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  interests TEXT[] DEFAULT '{}',
  reminder_days_before INTEGER DEFAULT 7,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📞 REMINDERS TABLE (Tracking sent reminders)
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID REFERENCES public.friends(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  status VARCHAR DEFAULT 'pending', -- pending, sent, failed
  reminder_type VARCHAR DEFAULT 'voice', -- voice, email, sms
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- 🔐 CONCEPT: Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- 🛡️ CONCEPT: Security Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own friends" ON public.friends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own friends" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friends" ON public.friends
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own friends" ON public.friends
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders" ON public.reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON public.reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 🔄 CONCEPT: Database Triggers
-- Automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 📅 CONCEPT: Useful Views
-- View for upcoming birthdays with calculated days
CREATE OR REPLACE VIEW public.upcoming_birthdays AS
SELECT 
  f.*,
  p.full_name as user_name,
  CASE 
    WHEN EXTRACT(DOY FROM (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' + (f.birthday - DATE_TRUNC('year', f.birthday)))) < EXTRACT(DOY FROM CURRENT_DATE) THEN
      (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '2 years' + (f.birthday - DATE_TRUNC('year', f.birthday))) - CURRENT_DATE
    ELSE
      (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' + (f.birthday - DATE_TRUNC('year', f.birthday))) - CURRENT_DATE
  END AS days_until_birthday
FROM public.friends f
JOIN public.profiles p ON f.user_id = p.id
WHERE f.is_active = true
ORDER BY days_until_birthday;

-- 📊 CONCEPT: Indexes for Performance
CREATE INDEX idx_friends_user_id ON public.friends(user_id);
CREATE INDEX idx_friends_birthday ON public.friends(birthday);
CREATE INDEX idx_reminders_friend_id ON public.reminders(friend_id);
CREATE INDEX idx_reminders_reminder_date ON public.reminders(reminder_date);
