"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { MonthlyReport } from "@/types/youtube";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface PDFReportProps {
  report: MonthlyReport;
  channelName?: string;
}

export default function PDFReport({ report, channelName }: PDFReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `youtube-report-${format(new Date(report.report_date), "yyyy-MM", {
        locale: ja,
      })}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDFの生成に失敗しました。");
    }
  };

  return (
    <div>
      <button
        onClick={generatePDF}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 mb-4"
      >
        PDFをダウンロード
      </button>

      <div
        ref={reportRef}
        className="bg-white p-8 max-w-4xl mx-auto shadow-lg"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* ヘッダー */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">YouTube Analytics Report</h1>
          <p className="text-xl text-gray-600">
            {channelName || "Channel"} -{" "}
            {format(new Date(report.report_date), "yyyy年M月", { locale: ja })}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            生成日: {format(new Date(), "yyyy年M月d日 HH:mm", { locale: ja })}
          </p>
        </div>

        {/* サマリー統計 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-blue-900">総再生回数</h3>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(report.total_views)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-900">総登録者数</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(report.total_subscribers)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-purple-900">平均視聴時間</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatDuration(report.average_view_duration)}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-yellow-900">平均視聴率</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {report.average_view_percentage.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">エンゲージメント統計</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">総いいね数:</span>
                <span className="font-semibold">{formatNumber(report.total_likes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">総コメント数:</span>
                <span className="font-semibold">{formatNumber(report.total_comments)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">登録者増加数:</span>
                <span
                  className={`font-semibold ${
                    report.subscriber_growth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {report.subscriber_growth > 0 ? "+" : ""}
                  {formatNumber(report.subscriber_growth)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">コンテンツ統計</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">動画数:</span>
                <span className="font-semibold">{report.video_count}本</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">総視聴時間:</span>
                <span className="font-semibold">{Math.floor(report.total_watch_time / 60)}分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">チャンネルID:</span>
                <span className="font-semibold text-sm">{report.channel_id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI要約 */}
        {report.summary && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI要約・分析</h3>
            <div className="space-y-6">
              {report.summary && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">要約</h4>
                  <p className="text-blue-800 whitespace-pre-wrap">{report.summary}</p>
                </div>
              )}
              {report.insights && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">洞察</h4>
                  <p className="text-green-800 whitespace-pre-wrap">{report.insights}</p>
                </div>
              )}
              {report.recommendations && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">推奨事項</h4>
                  <p className="text-purple-800 whitespace-pre-wrap">{report.recommendations}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="text-center text-sm text-gray-500 border-t-2 border-gray-300 pt-4">
          <p>このレポートはYouTube Analytics Dashboardによって自動生成されました。</p>
          <p>© 2024 YouTube Analytics Dashboard</p>
        </div>
      </div>
    </div>
  );
}
