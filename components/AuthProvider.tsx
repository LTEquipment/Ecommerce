"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserSupabase, supabaseConfigured } from "@/lib/supabase/browser";
import type { AccountRole, DealerStatus } from "@/lib/roles";
import { BACKEND_OFFLINE as NOT_CONFIGURED } from "@/lib/backendMessage";

type Result = { error?: string; needsConfirm?: boolean };

type Auth = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  /** True once the admins-table lookup for the current user has resolved. */
  adminChecked: boolean;
  role: AccountRole;
  dealerStatus: DealerStatus;
  isDealer: boolean; // dealer AND approved — safe to show contract pricing
  displayName: string;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string, company?: string, isTrade?: boolean) => Promise<Result>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<Result>;
  resendConfirmation: (email: string) => Promise<Result>;
};

const Ctx = createContext<Auth | null>(null);

export function useAuth(): Auth {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within <AuthProvider>");
  return c;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  // Bumped on every auth transition; a slow admins lookup that resolves after a
  // newer transition is discarded (prevents a stale isAdmin=true after switching
  // from an admin to a non-admin account in the same tab).
  const authEpochRef = useRef(0);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const checkAdmin = async (u: User | null) => {
      const epoch = ++authEpochRef.current;
      if (!u) { setIsAdmin(false); setAdminChecked(true); return; }
      // re-checking for a (possibly new) user — hold adminChecked until it resolves
      // so the admin console shows Loading, never a "Not authorized" flash.
      setAdminChecked(false);
      const { data } = await supabase.from("admins").select("user_id").eq("user_id", u.id).maybeSingle();
      if (authEpochRef.current !== epoch) return; // a newer auth event superseded this
      setIsAdmin(Boolean(data));
      setAdminChecked(true);
    };
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      checkAdmin(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      checkAdmin(s?.user ?? null);
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
    async (email: string, password: string, company?: string, isTrade = false): Promise<Result> => {
      const supabase = getBrowserSupabase();
      if (!supabase) return { error: NOT_CONFIGURED };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company: company ?? "",
            role: isTrade ? "dealer" : "customer",
            // Trade accounts start pending L&T review; pricing unlocks on approval.
            dealer_status: isTrade ? "pending" : null,
          },
        },
      });
      if (error) return { error: error.message };
      // If email confirmation is on, there is no active session yet.
      return { needsConfirm: !data.session };
    },
    []
  );

  const signOut = useCallback(async () => {
    authEpochRef.current++; // invalidate any in-flight admin check
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setAdminChecked(true);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<Result> => {
    const supabase = getBrowserSupabase();
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? { error: error.message } : {};
  }, []);

  const resendConfirmation = useCallback(async (email: string): Promise<Result> => {
    const supabase = getBrowserSupabase();
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.resend({ type: "signup", email });
    return error ? { error: error.message } : {};
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "";
    const company = (user.user_metadata?.company as string) || "";
    if (company) return company;
    return user.email?.split("@")[0] ?? "Account";
  }, [user]);

  // `role` is a display hint from user_metadata (self-writable). The actual
  // ENTITLEMENT (isDealer -> contract pricing) is gated on app_metadata, which
  // only the service-role admin approve route can set — a user cannot self-grant
  // it via supabase.auth.updateUser().
  const role = ((user?.user_metadata?.role as AccountRole) || "customer");
  const appMeta = (user?.app_metadata ?? {}) as Record<string, unknown>;
  const approved = appMeta.dealer_status === "approved";
  const dealerStatus: DealerStatus = approved
    ? "approved"
    : ((user?.user_metadata?.dealer_status as DealerStatus) ?? null);
  const isDealer = approved;

  const value: Auth = {
    configured: supabaseConfigured,
    loading,
    user,
    session,
    isAdmin,
    adminChecked,
    role,
    dealerStatus,
    isDealer,
    displayName,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmation,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
