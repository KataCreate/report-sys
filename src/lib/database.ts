import { supabase } from "./supabase";
import { MonthlyReport, VideoAnalytics, AdminUser } from "@/types/youtube";

export class DatabaseService {
  // 月次レポート関連
  async getMonthlyReports(limit: number = 12): Promise<MonthlyReport[]> {
    const { data, error } = await supabase
      .from("monthly_reports")
      .select("*")
      .order("report_date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch monthly reports: ${error.message}`);
    }

    return data || [];
  }

  async getMonthlyReport(id: string): Promise<MonthlyReport | null> {
    const { data, error } = await supabase
      .from("monthly_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch monthly report: ${error.message}`);
    }

    return data;
  }

  async createMonthlyReport(
    report: Omit<MonthlyReport, "id" | "created_at" | "updated_at">
  ): Promise<MonthlyReport> {
    const { data, error } = await supabase
      .from("monthly_reports")
      .insert([report])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create monthly report: ${error.message}`);
    }

    return data;
  }

  async updateMonthlyReport(id: string, updates: Partial<MonthlyReport>): Promise<MonthlyReport> {
    const { data, error } = await supabase
      .from("monthly_reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update monthly report: ${error.message}`);
    }

    return data;
  }

  async deleteMonthlyReport(id: string): Promise<void> {
    const { error } = await supabase.from("monthly_reports").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete monthly report: ${error.message}`);
    }
  }

  // 動画アナリティクス関連
  async getVideoAnalytics(reportId: string): Promise<VideoAnalytics[]> {
    const { data, error } = await supabase
      .from("video_analytics")
      .select("*")
      .eq("report_id", reportId)
      .order("views", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch video analytics: ${error.message}`);
    }

    return data || [];
  }

  async createVideoAnalytics(
    analytics: Omit<VideoAnalytics, "id" | "created_at">
  ): Promise<VideoAnalytics> {
    const { data, error } = await supabase
      .from("video_analytics")
      .insert([analytics])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create video analytics: ${error.message}`);
    }

    return data;
  }

  async createMultipleVideoAnalytics(
    analyticsList: Omit<VideoAnalytics, "id" | "created_at">[]
  ): Promise<VideoAnalytics[]> {
    const { data, error } = await supabase.from("video_analytics").insert(analyticsList).select();

    if (error) {
      throw new Error(`Failed to create video analytics: ${error.message}`);
    }

    return data || [];
  }

  // 管理者ユーザー関連
  async getAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch admin users: ${error.message}`);
    }

    return data || [];
  }

  async createAdminUser(email: string, role: string = "admin"): Promise<AdminUser> {
    const { data, error } = await supabase
      .from("admin_users")
      .insert([{ email, role }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create admin user: ${error.message}`);
    }

    return data;
  }

  async deleteAdminUser(id: string): Promise<void> {
    const { error } = await supabase.from("admin_users").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete admin user: ${error.message}`);
    }
  }

  // 統計データ取得
  async getMonthlyReportStats(): Promise<{
    totalReports: number;
    latestReport: MonthlyReport | null;
    averageViews: number;
    averageSubscribers: number;
  }> {
    const { data: reports, error } = await supabase
      .from("monthly_reports")
      .select("*")
      .order("report_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch report stats: ${error.message}`);
    }

    if (!reports || reports.length === 0) {
      return {
        totalReports: 0,
        latestReport: null,
        averageViews: 0,
        averageSubscribers: 0,
      };
    }

    const totalViews = reports.reduce((sum, report) => sum + report.total_views, 0);
    const totalSubscribers = reports.reduce((sum, report) => sum + report.total_subscribers, 0);

    return {
      totalReports: reports.length,
      latestReport: reports[0],
      averageViews: Math.round(totalViews / reports.length),
      averageSubscribers: Math.round(totalSubscribers / reports.length),
    };
  }
}

export const databaseService = new DatabaseService();
