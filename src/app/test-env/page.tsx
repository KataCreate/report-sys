"use client";

import { useState } from "react";

export default function TestEnvPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  const checkEnvVars = () => {
    const vars = {
      NEXT_PUBLIC_YOUTUBE_API_KEY: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "NOT_SET",
      NEXT_PUBLIC_YOUTUBE_CHANNEL_ID: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || "NOT_SET",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT_SET",
    };
    setEnvVars(vars);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">環境変数テスト</h1>

        <button
          onClick={checkEnvVars}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-4"
        >
          環境変数をチェック
        </button>

        <div className="space-y-2">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded">
              <div className="font-mono text-sm">
                <span className="text-gray-600">{key}:</span>
                <span className={`ml-2 ${value === "NOT_SET" ? "text-red-600" : "text-green-600"}`}>
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">注意</h3>
          <p className="text-sm text-yellow-700">
            このページは開発環境でのみ利用可能です。本番環境では表示されません。
          </p>
        </div>
      </div>
    </div>
  );
}
