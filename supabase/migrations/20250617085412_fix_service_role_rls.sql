-- Fix RLS policies to allow service role access
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON monthly_reports;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON video_analytics;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON channels;

-- Create new policies that allow all operations for authenticated users and service role
CREATE POLICY "Allow all access for authenticated users and service role" ON monthly_reports
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow all access for authenticated users and service role" ON video_analytics
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow all access for authenticated users and service role" ON channels
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
