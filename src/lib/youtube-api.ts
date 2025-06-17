import { YouTubeChannelStats, YouTubeVideoStats, YouTubeAnalyticsData } from "@/types/youtube";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

if (!YOUTUBE_API_KEY) {
  throw new Error("YOUTUBE_API_KEY is not defined");
}

if (!YOUTUBE_CHANNEL_ID) {
  throw new Error("YOUTUBE_CHANNEL_ID is not defined");
}

export class YouTubeAPI {
  private apiKey: string;
  private channelId: string;

  constructor() {
    this.apiKey = YOUTUBE_API_KEY!;
    this.channelId = YOUTUBE_CHANNEL_ID!;
  }

  // チャンネル統計情報を取得
  async getChannelStats(): Promise<YouTubeChannelStats> {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${this.channelId}&key=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch channel stats: ${response.statusText}`);
    }

    const data = await response.json();
    const channel = data.items[0];

    if (!channel) {
      throw new Error("Channel not found");
    }

    return {
      totalSubscriberCount: parseInt(channel.statistics.subscriberCount || "0"),
      totalViewCount: parseInt(channel.statistics.viewCount || "0"),
      totalVideoCount: parseInt(channel.statistics.videoCount || "0"),
    };
  }

  // チャンネルの動画一覧を取得
  async getChannelVideos(maxResults: number = 50): Promise<YouTubeVideoStats[]> {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${this.channelId}&maxResults=${maxResults}&order=date&type=video&key=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch channel videos: ${response.statusText}`);
    }

    const data = await response.json();
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

    // 動画の詳細統計を取得
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${this.apiKey}`
    );

    if (!statsResponse.ok) {
      throw new Error(`Failed to fetch video stats: ${statsResponse.statusText}`);
    }

    const statsData = await statsResponse.json();

    return statsData.items.map((video: any) => ({
      videoId: video.id,
      title: video.snippet.title,
      viewCount: parseInt(video.statistics.viewCount || "0"),
      likeCount: parseInt(video.statistics.likeCount || "0"),
      commentCount: parseInt(video.statistics.commentCount || "0"),
      publishedAt: video.snippet.publishedAt,
    }));
  }

  // 特定の期間のアナリティクスデータを取得（YouTube Analytics API）
  async getAnalyticsData(startDate: string, endDate: string): Promise<YouTubeAnalyticsData> {
    // Note: YouTube Analytics API requires OAuth 2.0 authentication
    // This is a simplified version using the Data API
    // For full analytics, you would need to implement OAuth 2.0 flow

    const videos = await this.getChannelVideos(100);

    // 期間内の動画をフィルタリング
    const filteredVideos = videos.filter((video) => {
      const publishedDate = new Date(video.publishedAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return publishedDate >= start && publishedDate <= end;
    });

    // 統計を集計
    const totalViews = filteredVideos.reduce((sum, video) => sum + video.viewCount, 0);
    const totalLikes = filteredVideos.reduce((sum, video) => sum + video.likeCount, 0);
    const totalComments = filteredVideos.reduce((sum, video) => sum + video.commentCount, 0);

    return {
      views: totalViews,
      estimatedMinutesWatched: totalViews * 5, // 仮の平均視聴時間（5分）
      averageViewDuration: 300, // 仮の平均視聴時間（5分）
      averageViewPercentage: 60, // 仮の平均視聴率（60%）
      likes: totalLikes,
      comments: totalComments,
      shares: 0, // シェア数は別途取得が必要
    };
  }

  // 月次レポートデータを生成
  async generateMonthlyReport(year: number, month: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const [channelStats, analyticsData] = await Promise.all([
      this.getChannelStats(),
      this.getAnalyticsData(startDate, endDate),
    ]);

    return {
      report_date: startDate,
      channel_id: this.channelId,
      total_views: channelStats.totalViewCount,
      total_subscribers: channelStats.totalSubscriberCount,
      subscriber_growth: 0, // 前月比は別途計算が必要
      total_likes: analyticsData.likes,
      total_comments: analyticsData.comments,
      average_view_duration: analyticsData.averageViewDuration,
      average_view_percentage: analyticsData.averageViewPercentage,
      total_watch_time: analyticsData.estimatedMinutesWatched,
      video_count: channelStats.totalVideoCount,
    };
  }
}

export const youtubeAPI = new YouTubeAPI();
