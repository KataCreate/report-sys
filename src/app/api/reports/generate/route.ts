import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { youtubeAPI } from "@/lib/youtube-api";
import { openaiAPI } from "@/lib/openai-api";
import { databaseService } from "@/lib/database";

// サーバーサイド用のSupabaseクライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // "Bearer " を除去

    // トークンでユーザーを認証
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { channelId, year, month } = await request.json();

    if (!channelId || !year || !month) {
      return NextResponse.json(
        { error: "Channel ID, year and month are required" },
        { status: 400 }
      );
    }

    console.log(`Generating report for user: ${user.email}, channel: ${channelId}, year: ${year}, month: ${month}`);

    // YouTube APIからデータを取得
    const reportData = await youtubeAPI.generateMonthlyReport(channelId, year, month);

    // ユーザーIDを追加
    const reportWithUser = {
      ...reportData,
      user_id: user.id,
    };

    // データベースに保存（RLSが無効化されているので直接保存可能）
    const { data: savedReport, error: saveError } = await supabase
      .from('monthly_reports')
      .insert([reportWithUser])
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save report:", saveError);
      return NextResponse.json(
        { error: `Failed to save report: ${saveError.message}` },
        { status: 500 }
      );
    }

    // OpenAI APIで要約を生成
    try {
      const summary = await openaiAPI.generateReportSummary(savedReport);

      // 要約をデータベースに更新
      const { error: updateError } = await supabase
        .from('monthly_reports')
        .update({
          summary: summary.summary,
          insights: summary.insights,
          recommendations: summary.recommendations,
        })
        .eq('id', savedReport.id);

      if (updateError) {
        console.error("Failed to update report with summary:", updateError);
      }

      // 更新されたレポートを取得
      const { data: updatedReport, error: fetchError } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('id', savedReport.id)
        .single();

      if (fetchError) {
        console.error("Failed to fetch updated report:", fetchError);
        return NextResponse.json({
          success: true,
          report: savedReport,
          summary: summary,
        });
      }

      return NextResponse.json({
        success: true,
        report: updatedReport,
        summary: summary,
      });
    } catch (summaryError) {
      console.error("Failed to generate summary:", summaryError);

      // 要約の生成に失敗してもレポートは返す
      return NextResponse.json({
        success: true,
        report: savedReport,
        summary: null,
        summaryError: "Failed to generate AI summary",
      });
    }
  } catch (error: any) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
