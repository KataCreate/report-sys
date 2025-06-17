"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { databaseService } from "@/lib/database";
import { youtubeAPI } from "@/lib/youtube-api";
import { Channel } from "@/types/youtube";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChannelId, setNewChannelId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadChannels();
    }
  }, [user, authLoading, router]);

  const loadChannels = async () => {
    try {
      console.log("Loading channels for user:", user?.email);
      const channelsData = await databaseService.getChannels();
      console.log("Channels loaded:", channelsData);
      setChannels(channelsData);
    } catch (error: any) {
      console.error("Failed to load channels:", error);
      setError(`チャンネルの読み込みに失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      console.log("Adding channel:", newChannelId);
      // YouTube APIからチャンネル情報を取得
      const channelInfo = await youtubeAPI.getChannelInfo(newChannelId);
      console.log("Channel info:", channelInfo);

      // データベースに保存
      const newChannel = await databaseService.createChannel({
        channel_id: channelInfo.channelId,
        channel_name: channelInfo.channelName,
        channel_url: channelInfo.channelUrl,
        is_active: true,
      });
      console.log("Channel created:", newChannel);

      // フォームをリセット
      setNewChannelId("");
      setShowAddForm(false);

      // チャンネル一覧を再読み込み
      await loadChannels();
    } catch (error: any) {
      console.error("Failed to add channel:", error);
      setError(error.message || "チャンネルの追加に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (channelId: string, isActive: boolean) => {
    try {
      await databaseService.updateChannel(channelId, { is_active: !isActive });
      await loadChannels();
    } catch (error: any) {
      console.error("Failed to update channel:", error);
      setError(`チャンネルの更新に失敗しました: ${error.message}`);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm("このチャンネルを削除しますか？関連するレポートデータも削除されます。")) {
      return;
    }

    try {
      await databaseService.deleteChannel(channelId);
      await loadChannels();
    } catch (error: any) {
      console.error("Failed to delete channel:", error);
      setError(`チャンネルの削除に失敗しました: ${error.message}`);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">チャンネル管理</h1>
              <p className="text-gray-600">YouTubeチャンネルの追加・編集・削除</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                ダッシュボード
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                チャンネル追加
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Channel Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">チャンネルを追加</h2>
            <form onSubmit={handleAddChannel} className="space-y-4">
              <div>
                <label htmlFor="channelId" className="block text-sm font-medium text-gray-700">
                  YouTubeチャンネルID
                </label>
                <input
                  type="text"
                  id="channelId"
                  value={newChannelId}
                  onChange={(e) => setNewChannelId(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="UCxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  チャンネルIDはYouTubeチャンネルURLから取得できます
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "追加中..." : "追加"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Channels List */}
        {channels.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <svg
                              className="h-6 w-6 text-red-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {channel.channel_name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  channel.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {channel.is_active ? "アクティブ" : "非アクティブ"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                                  />
                                </svg>
                                {channel.channel_id}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <p>
                                追加日: {new Date(channel.created_at).toLocaleDateString("ja-JP")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(channel.id, channel.is_active)}
                          className={`px-3 py-1 rounded text-sm ${
                            channel.is_active
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {channel.is_active ? "無効化" : "有効化"}
                        </button>
                        <a
                          href={channel.channel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
                        >
                          表示
                        </a>
                        <button
                          onClick={() => handleDeleteChannel(channel.id)}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              チャンネルが登録されていません
            </h3>
            <p className="text-gray-600 mb-4">チャンネルを追加してレポートを生成できます。</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              チャンネルを追加
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
