import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Phone, Shield } from "lucide-react";
import { useAuth, roleHomePath } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  full_name: string | null;
  phone: string | null;
  requested_role: string;
}

const roleNames: Record<string, string> = {
  admin: "Administrator",
  distributor: "Distributor / Dealer",
  field_officer: "Field Officer",
  farmer: "Farmer",
  user: "Member",
  moderator: "Moderator",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, roles, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, requested_role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data);
        setLoadingProfile(false);
      });
  }, [user]);

  if (authLoading || loadingProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const portalPath = roleHomePath(roles);
  const showGoToPortal = portalPath !== "/";

  return (
    <Layout>
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">
            Welcome, {profile?.full_name || user?.email}
          </h1>
          <p className="text-primary-foreground/80 mt-1">Your account dashboard</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.full_name || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-primary">
                  {roles.length > 0 ? roles.map((r) => roleNames[r] || r).join(", ") : "Pending approval"}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            {showGoToPortal && (
              <Button onClick={() => navigate(portalPath)}>Go to my portal</Button>
            )}
            <Button variant="outline" onClick={async () => { await signOut(); navigate("/"); }}>
              Sign Out
            </Button>
          </div>

          {roles.length === 0 && (
            <Card className="border-accent/30">
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Your account is awaiting role assignment by an administrator.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;