import { NextRequest, NextResponse } from "next/server";
import { youtubeAPI } from "@/lib/youtube-api";
import { databaseService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { year, month } = await request.json();

    if (!year || !month) {
      return NextResponse.json({ error: "Year and month are required" }, { status: 400 });
    }

    // YouTube APIからデータを取得
    const reportData = await youtubeAPI.generateMonthlyReport(year, month);

    // データベースに保存
    const savedReport = await databaseService.createMonthlyReport(reportData);

    return NextResponse.json({
      success: true,
      report: savedReport,
    });
  } catch (error: any) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
