import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DistributorSidebar } from "./DistributorSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DistributorLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const DistributorLayout = ({ children, title, subtitle }: DistributorLayoutProps) => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["layout-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["dist-unread", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("read", false);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const initials = (profile?.full_name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DistributorSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="font-heading text-lg font-bold text-foreground leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/distributor/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {(unreadCount ?? 0) > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />}
                </Button>
              </Link>
              <Link to="/distributor/profile">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{initials}</span>
                </div>
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DistributorLayout;
