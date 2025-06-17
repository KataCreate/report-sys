"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("認証コールバックエラー:", error);
          router.push("/login?error=auth_callback_failed");
          return;
        }

        if (data.session) {
          console.log("認証コールバック成功:", data.session.user.email);
          router.push("/dashboard");
        } else {
          console.log("セッションが見つかりません");
          router.push("/login");
        }
      } catch (error) {
        console.error("認証コールバック例外:", error);
        router.push("/login?error=unexpected_error");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">認証中...</h2>
        <p className="text-gray-600">認証を処理しています。しばらくお待ちください。</p>
      </div>
    </div>
  );
}
