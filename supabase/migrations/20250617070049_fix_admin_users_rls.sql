-- Drop existing RLS policies for admin_users
DROP POLICY IF EXISTS "Allow admin access" ON admin_users;

-- Create new RLS policies for admin_users
-- Allow authenticated users to read admin_users
CREATE POLICY "Allow read access for authenticated users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert into admin_users (for registration)
CREATE POLICY "Allow insert for authenticated users" ON admin_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own admin record
CREATE POLICY "Allow update own admin record" ON admin_users
  FOR UPDATE USING (auth.role() = 'authenticated' AND email = auth.jwt() ->> 'email');

-- Allow authenticated users to delete admin records
CREATE POLICY "Allow delete for authenticated users" ON admin_users
  FOR DELETE USING (auth.role() = 'authenticated');
