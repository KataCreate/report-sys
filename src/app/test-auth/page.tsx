"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestAuthPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 本番環境では表示しない
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">アクセスできません</h1>
          <p className="text-gray-600">このページは開発環境でのみ利用可能です。</p>
        </div>
      </div>
    );
  }

  const testSignUp = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(`エラー: ${error.message}`);
      } else {
        setMessage(`成功: ${data.user ? "ユーザー作成成功" : "確認メール送信済み"}`);
      }
    } catch (error: any) {
      setMessage(`例外エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`エラー: ${error.message}`);
      } else {
        setMessage(`成功: ログイン成功 - ${data.user?.email}`);
      }
    } catch (error: any) {
      setMessage(`例外エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.from("admin_users").select("count").limit(1);

      if (error) {
        setMessage(`接続エラー: ${error.message}`);
      } else {
        setMessage(`接続成功: データベースにアクセス可能`);
      }
    } catch (error: any) {
      setMessage(`例外エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">認証テスト (開発環境)</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={testConnection}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              接続テスト
            </button>

            <button
              onClick={testSignUp}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              登録テスト
            </button>

            <button
              onClick={testSignIn}
              disabled={loading}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50"
            >
              ログインテスト
            </button>
          </div>

          {message && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <p className="text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
