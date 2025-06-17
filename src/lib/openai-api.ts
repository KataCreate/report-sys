import OpenAI from "openai";
import { MonthlyReport, ReportSummary } from "@/types/youtube";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not defined");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export class OpenAIAPI {
  // レポート要約を生成
  async generateReportSummary(report: MonthlyReport): Promise<ReportSummary> {
    const prompt = `
以下のYouTubeチャンネルの月次レポートデータを分析して、要約、洞察、推奨事項を生成してください。

【レポートデータ】
- レポート期間: ${report.report_date}
- 総再生回数: ${report.total_views.toLocaleString()}回
- 総登録者数: ${report.total_subscribers.toLocaleString()}人
- 登録者増加数: ${
      report.subscriber_growth > 0 ? "+" : ""
    }${report.subscriber_growth.toLocaleString()}人
- 総いいね数: ${report.total_likes.toLocaleString()}個
- 総コメント数: ${report.total_comments.toLocaleString()}個
- 平均視聴時間: ${Math.floor(report.average_view_duration / 60)}分${
      report.average_view_duration % 60
    }秒
- 平均視聴率: ${report.average_view_percentage.toFixed(1)}%
- 総視聴時間: ${Math.floor(report.total_watch_time / 60)}分
- 動画数: ${report.video_count}本

以下の形式で回答してください：

【要約】
（この月のパフォーマンスを簡潔にまとめてください）

【洞察】
（データから読み取れる重要な発見や傾向を分析してください）

【推奨事項】
（今後の改善のための具体的な提案をしてください）
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "あなたはYouTubeアナリストです。データを分析して実用的な洞察と推奨事項を提供してください。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || "";

      // レスポンスを解析して構造化データに変換
      const summary = this.extractSection(response, "要約");
      const insights = this.extractSection(response, "洞察");
      const recommendations = this.extractSection(response, "推奨事項");

      return {
        summary: summary || "要約を生成できませんでした。",
        insights: insights || "洞察を生成できませんでした。",
        recommendations: recommendations || "推奨事項を生成できませんでした。",
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return {
        summary: "AI要約の生成中にエラーが発生しました。",
        insights: "AI洞察の生成中にエラーが発生しました。",
        recommendations: "AI推奨事項の生成中にエラーが発生しました。",
      };
    }
  }

  // レスポンスから特定のセクションを抽出
  private extractSection(response: string, sectionName: string): string {
    const regex = new RegExp(`【${sectionName}】\\s*([\\s\\S]*?)(?=【|$)`, "i");
    const match = response.match(regex);
    return match ? match[1].trim() : "";
  }
}

export const openaiAPI = new OpenAIAPI();
