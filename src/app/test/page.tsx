"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [status, setStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Supabase接続をテスト（存在しないテーブルでクエリを実行）
        const { error } = await supabase.from("_dummy_table_").select("*").limit(1);

        if (error) {
          // PGRST116: テーブルが存在しないエラーは正常（接続は成功）
          if (error.code === "PGRST116" || error.message.includes("does not exist")) {
            setStatus("✅ Supabase接続成功！");
          } else {
            setError(`接続エラー: ${error.message}`);
          }
        } else {
          setStatus("✅ Supabase接続成功！");
        }
      } catch (err) {
        setError(`予期しないエラー: ${err}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Supabase接続テスト</h1>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">接続状況:</p>
            <p
              className={`font-medium ${
                status.includes("成功") ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {status}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 mb-2">エラー:</p>
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-2">環境変数:</p>
            <p className="text-xs text-blue-800">
              URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ 設定済み" : "❌ 未設定"}
            </p>
            <p className="text-xs text-blue-800">
              ANON KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ 設定済み" : "❌ 未設定"}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-2">説明:</p>
            <p className="text-xs text-green-800">
              「テーブルが存在しない」エラーは正常な動作です。これはSupabaseへの接続が成功していることを意味します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
