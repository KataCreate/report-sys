-- Fix RLS policies for monthly_reports table
-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON monthly_reports;
DROP POLICY IF EXISTS "Allow admin access to monthly_reports" ON monthly_reports;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON monthly_reports;

-- Create new policies that allow all operations for authenticated users and service role
CREATE POLICY "Allow all access for authenticated users and service role" ON monthly_reports
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Also fix video_analytics table policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON video_analytics;
DROP POLICY IF EXISTS "Allow admin access to video_analytics" ON video_analytics;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON video_analytics;

CREATE POLICY "Allow all access for authenticated users and service role" ON video_analytics
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Fix channels table policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON channels;
DROP POLICY IF EXISTS "Allow admin access to channels" ON channels;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON channels;

CREATE POLICY "Allow all access for authenticated users and service role" ON channels
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');