"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { databaseService } from "@/lib/database";
import { MonthlyReport, Channel } from "@/types/youtube";
import ViewsChart from "@/components/charts/ViewsChart";
import SubscribersChart from "@/components/charts/SubscribersChart";
import ViewDurationChart from "@/components/charts/ViewDurationChart";
import PDFReport from "@/components/PDFReport";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const [reportsData, channelsData] = await Promise.all([
        databaseService.getMonthlyReports(),
        databaseService.getActiveChannels(),
      ]);
      setReports(reportsData);
      setChannels(channelsData);

      // 最初のチャンネルを選択
      if (channelsData.length > 0 && !selectedChannel) {
        setSelectedChannel(channelsData[0].channel_id);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedChannel) {
      alert("チャンネルを選択してください");
      return;
    }

    setGenerating(true);
    try {
      // 現在のセッショントークンを取得
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("認証が必要です。再度ログインしてください。");
        return;
      }

      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          channelId: selectedChannel,
          year: selectedYear,
          month: selectedMonth,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("レポートが生成されました");
        await loadData();
      } else {
        alert("レポートの生成に失敗しました: " + data.error);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("レポートの生成に失敗しました");
    } finally {
      setGenerating(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getChannelName = (channelId: string) => {
    const channel = channels.find((c) => c.channel_id === channelId);
    return channel?.channel_name || channelId;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredReports = selectedChannel
    ? reports.filter((report) => report.channel_id === selectedChannel)
    : reports;

  const latestReport = filteredReports[0];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">YouTube Analytics Dashboard</h1>
              <p className="text-gray-600">チャンネルパフォーマンスの分析とレポート生成</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/channels")}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                チャンネル管理
              </button>
              <button
                onClick={() => router.push("/reports")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                レポート一覧
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Channel Selection and Report Generation */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">レポート生成</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">チャンネル</label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">チャンネルを選択</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.channel_id}>
                    {channel.channel_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">月</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={generating || !selectedChannel}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {generating ? "生成中..." : "レポート生成"}
              </button>
            </div>
          </div>
        </div>

        {/* Latest Report Summary */}
        {latestReport && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                最新レポート - {getChannelName(latestReport.channel_id)}
              </h2>
              <button
                onClick={() => setSelectedReport(latestReport)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                PDF出力
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-blue-900">総再生回数</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(latestReport.total_views)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-green-900">総登録者数</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(latestReport.total_subscribers)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-purple-900">平均視聴時間</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.floor(latestReport.average_view_duration / 60)}分
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-yellow-900">平均視聴率</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {latestReport.average_view_percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* AI要約 */}
            {latestReport.summary && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI要約・分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {latestReport.summary && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">要約</h4>
                      <p className="text-blue-800 text-sm">{latestReport.summary}</p>
                    </div>
                  )}
                  {latestReport.insights && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">洞察</h4>
                      <p className="text-green-800 text-sm">{latestReport.insights}</p>
                    </div>
                  )}
                  {latestReport.recommendations && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">推奨事項</h4>
                      <p className="text-purple-800 text-sm">{latestReport.recommendations}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts */}
        {filteredReports.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">再生回数推移</h3>
              <ViewsChart reports={filteredReports} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">登録者数推移</h3>
              <SubscribersChart reports={filteredReports} />
            </div>
          </div>
        )}

        {filteredReports.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">平均視聴時間推移</h3>
            <ViewDurationChart reports={filteredReports} />
          </div>
        )}

        {/* PDF Report Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  PDFレポート - {getChannelName(selectedReport.channel_id)}
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <PDFReport
                report={selectedReport}
                channelName={getChannelName(selectedReport.channel_id)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
