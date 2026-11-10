import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, setStoredSessionToken } from "@/lib/api";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { PublicUser } from "@/lib/types";

export type RegisterResult = {
  user: PublicUser | null;
  needsEmailVerification: boolean;
};

type AuthContextValue = {
  user: PublicUser | null;
  isLoading: boolean;
  unreadNotifications: number;
  isSupabaseAuth: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (input: {
    email: string;
    name: string;
    password: string;
    role: "REQUESTER" | "REVIEWER";
  }) => Promise<RegisterResult>;
  resendVerification: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  demoLogin: (role: "requester" | "reviewer") => Promise<PublicUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [supabaseSessionReady, setSupabaseSessionReady] = useState(!isSupabaseConfigured);

  // 1. Supabase Auth Lifecycle Listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSupabaseSessionReady(true);
      return;
    }

    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setStoredSessionToken(session.access_token);
      }
      setSupabaseSessionReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        setStoredSessionToken(session.access_token);
        try {
          const syncResult = await api.auth.supabaseSync(session.access_token);
          queryClient.setQueryData(["auth", "me"], {
            user: syncResult.user,
            unreadNotifications: 0,
          });
        } catch {
          // Sync might fail if backend is unreachable, fallback to me query
          queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        }
      } else if (event === "SIGNED_OUT") {
        setStoredSessionToken(null);
        queryClient.setQueryData(["auth", "me"], {
          user: null,
          unreadNotifications: 0,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // 2. Local Database Me Query
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        return await api.auth.me();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return { user: null, unreadNotifications: 0 };
        }
        throw error;
      }
    },
    enabled: supabaseSessionReady,
    retry: false,
    staleTime: 30_000,
  });

  const demoMutation = useMutation({
    mutationFn: (role: "requester" | "reviewer") => api.auth.demoLogin(role),
  });

  const logoutMutation = useMutation({ mutationFn: () => api.auth.logout() });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data?.user ?? null,
      isLoading: !supabaseSessionReady || meQuery.isLoading,
      unreadNotifications: meQuery.data?.unreadNotifications ?? 0,
      isSupabaseAuth: isSupabaseConfigured,

      login: async (email: string, password: string) => {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            throw new ApiError(401, "INVALID_CREDENTIALS", error.message);
          }

          if (!data.session?.access_token) {
            throw new ApiError(
              403,
              "EMAIL_NOT_VERIFIED",
              "Please check your inbox and verify your email address before signing in.",
            );
          }

          setStoredSessionToken(data.session.access_token);
          const sync = await api.auth.supabaseSync(data.session.access_token);
          queryClient.setQueryData(["auth", "me"], {
            user: sync.user,
            unreadNotifications: 0,
          });
          await queryClient.invalidateQueries({
            predicate: (q) => q.queryKey[0] !== "auth" || q.queryKey[1] !== "me",
          });
          return sync.user;
        }

        // Fallback local backend login
        const result = await api.auth.login({ email, password });
        queryClient.setQueryData(["auth", "me"], {
          user: result.user,
          unreadNotifications: 0,
        });
        await queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] !== "auth" || q.queryKey[1] !== "me",
        });
        return result.user;
      },

      register: async (input) => {
        if (isSupabaseConfigured) {
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          const { data, error } = await supabase.auth.signUp({
            email: input.email,
            password: input.password,
            options: {
              data: {
                name: input.name,
                role: input.role,
              },
              emailRedirectTo: `${origin}/login?verified=1`,
            },
          });

          if (error) {
            throw new ApiError(400, "REGISTRATION_FAILED", error.message);
          }

          // If session was returned immediately (email confirmation disabled in Supabase project)
          if (data.session?.access_token) {
            setStoredSessionToken(data.session.access_token);
            const sync = await api.auth.supabaseSync(data.session.access_token, {
              role: input.role,
              name: input.name,
            });
            queryClient.setQueryData(["auth", "me"], {
              user: sync.user,
              unreadNotifications: 0,
            });
            return { user: sync.user, needsEmailVerification: false };
          }

          // Email confirmation is required
          return { user: null, needsEmailVerification: true };
        }

        // Fallback local backend registration
        const result = await api.auth.register(input);
        queryClient.setQueryData(["auth", "me"], {
          user: result.user,
          unreadNotifications: 0,
        });
        await queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] !== "auth" || q.queryKey[1] !== "me",
        });
        return { user: result.user, needsEmailVerification: false };
      },

      resendVerification: async (email: string) => {
        if (isSupabaseConfigured) {
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          const { error } = await supabase.auth.resend({
            type: "signup",
            email,
            options: {
              emailRedirectTo: `${origin}/login?verified=1`,
            },
          });
          if (error) {
            throw new ApiError(400, "RESEND_FAILED", error.message);
          }
        }
      },

      resetPassword: async (email: string) => {
        if (isSupabaseConfigured) {
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/login?mode=recovery`,
          });
          if (error) {
            throw new ApiError(400, "RESET_FAILED", error.message);
          }
        }
      },

      updatePassword: async (newPassword: string) => {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) {
            throw new ApiError(400, "UPDATE_FAILED", error.message);
          }
        }
      },

      demoLogin: async (role) => {
        const result = await demoMutation.mutateAsync(role);
        queryClient.setQueryData(["auth", "me"], {
          user: result.user,
          unreadNotifications: 0,
        });
        await queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] !== "auth" || q.queryKey[1] !== "me",
        });
        return result.user;
      },

      logout: async () => {
        if (isSupabaseConfigured) {
          await supabase.auth.signOut().catch(() => undefined);
        }
        setStoredSessionToken(null);
        await logoutMutation.mutateAsync().catch(() => undefined);
        queryClient.clear();
        queryClient.setQueryData(["auth", "me"], {
          user: null,
          unreadNotifications: 0,
        });
      },

      refresh: async () => {
        await meQuery.refetch();
      },
    }),
    [meQuery, supabaseSessionReady, demoMutation, logoutMutation, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
