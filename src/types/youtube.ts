export interface MonthlyReport {
  id: string;
  report_date: string;
  channel_id: string;
  total_views: number;
  total_subscribers: number;
  subscriber_growth: number;
  total_likes: number;
  total_comments: number;
  average_view_duration: number;
  average_view_percentage: number;
  total_watch_time: number;
  video_count: number;
  created_at: string;
  updated_at: string;
}

export interface VideoAnalytics {
  id: string;
  report_id: string;
  video_id: string;
  video_title: string;
  views: number;
  likes: number;
  comments: number;
  view_duration: number;
  view_percentage: number;
  published_at: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface YouTubeChannelStats {
  totalSubscriberCount: number;
  totalViewCount: number;
  totalVideoCount: number;
}

export interface YouTubeVideoStats {
  videoId: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

export interface YouTubeAnalyticsData {
  views: number;
  estimatedMinutesWatched: number;
  averageViewDuration: number;
  averageViewPercentage: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}
