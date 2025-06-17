-- Create tables for YouTube analytics data
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT UNIQUE NOT NULL,
  channel_name TEXT NOT NULL,
  channel_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL,
  channel_id TEXT NOT NULL,
  total_views BIGINT NOT NULL,
  total_subscribers BIGINT NOT NULL,
  subscriber_growth INTEGER NOT NULL,
  total_likes BIGINT NOT NULL,
  total_comments BIGINT NOT NULL,
  average_view_duration FLOAT NOT NULL,
  average_view_percentage FLOAT NOT NULL,
  total_watch_time BIGINT NOT NULL,
  video_count INTEGER NOT NULL,
  summary TEXT,
  insights TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_date, channel_id)
);

CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES monthly_reports(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  views BIGINT NOT NULL,
  likes BIGINT NOT NULL,
  comments BIGINT NOT NULL,
  view_duration FLOAT NOT NULL,
  view_percentage FLOAT NOT NULL,
  published_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channels_channel_id ON channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_channels_active ON channels(is_active);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_date ON monthly_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_channel ON monthly_reports(channel_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_report ON video_analytics(report_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_video ON video_analytics(video_id);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access for authenticated users" ON channels
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin access to channels" ON channels
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON monthly_reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin access to monthly_reports" ON monthly_reports
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON video_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin access to video_analytics" ON video_analytics
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin access" ON admin_users
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_reports_updated_at
  BEFORE UPDATE ON monthly_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
