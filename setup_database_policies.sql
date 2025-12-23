-- Database setup script for production
-- Run this in Supabase SQL Editor

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can read own record" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update user roles" ON users;

-- Allow users to insert their own record during registration
CREATE POLICY "Users can insert own record" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to read their own record
CREATE POLICY "Users can read own record" ON users 
FOR SELECT USING (auth.uid() = id);

-- Allow admins to read all users (for dashboard)
CREATE POLICY "Admins can read all users" ON users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

-- Allow admins to update user roles and status
CREATE POLICY "Admins can update user roles" ON users 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

-- Reports table policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
DROP POLICY IF EXISTS "Users can read own reports" ON reports;
DROP POLICY IF EXISTS "Everyone can read approved reports" ON reports;
DROP POLICY IF EXISTS "Admins can read all reports" ON reports;
DROP POLICY IF EXISTS "Admins can update report status" ON reports;

-- Allow users to insert their own reports
CREATE POLICY "Users can insert own reports" ON reports 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own reports
CREATE POLICY "Users can read own reports" ON reports 
FOR SELECT USING (auth.uid() = user_id);

-- Allow everyone to read approved reports (for public display)
CREATE POLICY "Everyone can read approved reports" ON reports 
FOR SELECT USING (status = 'APPROVED');

-- Allow admins to read all reports
CREATE POLICY "Admins can read all reports" ON reports 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

-- Allow admins to update report status
CREATE POLICY "Admins can update report status" ON reports 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

-- Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'reports')
ORDER BY tablename, policyname;