"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 開発環境でのみログを出力
const log = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

const logError = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, ...args);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期セッションを取得
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logError("セッション取得エラー:", error);
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        logError("セッション取得例外:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      log("認証状態変更:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    log("ログイン試行:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logError("ログインエラー:", error);
      throw error;
    }

    log("ログイン成功:", data.user?.email);
  };

  const signUp = async (email: string, password: string) => {
    log("登録試行:", email);

    // Supabase認証でユーザーを作成
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      logError("登録エラー:", error);
      throw error;
    }

    log("登録成功:", data.user?.email);

    // 管理者ユーザーテーブルにも追加（RLSエラーを回避するため、成功してもエラーを投げない）
    if (data.user) {
      try {
        // 直接Supabaseクライアントを使用してadmin_usersテーブルに挿入
        const { error: dbError } = await supabase
          .from("admin_users")
          .insert([{ email, role: "admin" }]);

        if (dbError) {
          logError("Failed to create admin user in database:", dbError);
          // データベースエラーでも認証は成功しているので、エラーを投げない
        } else {
          log("管理者ユーザーテーブルに追加成功");
        }
      } catch (dbError) {
        logError("Failed to create admin user in database:", dbError);
        // データベースエラーでも認証は成功しているので、エラーを投げない
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logError("ログアウトエラー:", error);
      throw error;
    }
    log("ログアウト成功");
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
