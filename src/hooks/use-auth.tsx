import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "farmer" | "distributor" | "field_officer" | "admin" | "moderator" | "user";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Set up listener FIRST (per Supabase docs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // Defer DB call to avoid deadlock inside the auth callback
        setTimeout(() => {
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", sess.user.id)
            .then(({ data }) => {
              setRoles((data ?? []).map((r: any) => r.role as AppRole));
            });
        }, 0);
      } else {
        setRoles([]);
      }
    });

    // 2) THEN fetch existing session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", sess.user.id)
          .then(({ data }) => {
            setRoles((data ?? []).map((r: any) => r.role as AppRole));
          });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, roles, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const roleHomePath = (roles: AppRole[]): string => {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("distributor")) return "/distributor";
  if (roles.includes("field_officer")) return "/field-officer";
  if (roles.includes("farmer")) return "/farmer";
  return "/";
};