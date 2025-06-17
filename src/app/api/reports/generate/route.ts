import { NextRequest, NextResponse } from "next/server";
import { youtubeAPI } from "@/lib/youtube-api";
import { openaiAPI } from "@/lib/openai-api";
import { databaseService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { channelId, year, month } = await request.json();

    if (!channelId || !year || !month) {
      return NextResponse.json(
        { error: "Channel ID, year and month are required" },
        { status: 400 }
      );
    }

    // YouTube APIからデータを取得
    const reportData = await youtubeAPI.generateMonthlyReport(channelId, year, month);

    // データベースに保存
    const savedReport = await databaseService.createMonthlyReport(reportData);

    // OpenAI APIで要約を生成
    try {
      const summary = await openaiAPI.generateReportSummary(savedReport);

      // 要約をデータベースに更新
      await databaseService.updateMonthlyReport(savedReport.id, {
        summary: summary.summary,
        insights: summary.insights,
        recommendations: summary.recommendations,
      });

      // 更新されたレポートを取得
      const updatedReport = await databaseService.getMonthlyReport(savedReport.id);

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
