"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserSupabase, supabaseConfigured } from "@/lib/supabase/browser";

type Result = { error?: string; needsConfirm?: boolean };

type Auth = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  displayName: string;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string, company?: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<Auth | null>(null);

export function useAuth(): Auth {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within <AuthProvider>");
  return c;
}

const NOT_CONFIGURED =
  "Sign-in isn't connected yet. Add your Supabase keys to .env.local (see README) to enable accounts.";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<Result> => {
    const supabase = getBrowserSupabase();
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, company?: string): Promise<Result> => {
      const supabase = getBrowserSupabase();
      if (!supabase) return { error: NOT_CONFIGURED };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { company: company ?? "" } },
      });
      if (error) return { error: error.message };
      // If email confirmation is on, there is no active session yet.
      return { needsConfirm: !data.session };
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "";
    const company = (user.user_metadata?.company as string) || "";
    if (company) return company;
    return user.email?.split("@")[0] ?? "Account";
  }, [user]);

  const value: Auth = {
    configured: supabaseConfigured,
    loading,
    user,
    session,
    displayName,
    signIn,
    signUp,
    signOut,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
