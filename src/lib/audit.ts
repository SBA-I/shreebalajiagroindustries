import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "user.deleted"
  | "user.deactivated"
  | "user.reactivated"
  | "user.role_granted"
  | "user.role_revoked"
  | "verification.approved"
  | "verification.rejected"
  | "verification.bulk_approved";

export interface AuditEntry {
  action: AuditAction;
  target_type: "user" | "profile" | "role" | "verification";
  target_id?: string;
  target_label?: string;
  details?: Record<string, unknown>;
}

export const logAudit = async (entry: AuditEntry) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      admin_name: prof?.full_name ?? user.email ?? null,
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id ?? null,
      target_label: entry.target_label ?? null,
      details: entry.details ?? {},
    });
  } catch {
    // never block user flow on audit failure
  }
};