import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DistributorLayout from "@/components/distributor/DistributorLayout";
import { Mail, MailOpen, Bell, ShoppingCart, MessageSquare, Megaphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

const typeIcons: Record<string, React.ElementType> = {
  support: MessageSquare,
  announcement: Megaphone,
  order: ShoppingCart,
  general: Bell,
};

const typeColors: Record<string, string> = {
  support: "text-blue-600 bg-blue-50",
  announcement: "text-primary bg-primary/10",
  order: "text-secondary bg-secondary/10",
  general: "text-muted-foreground bg-muted",
};

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["dist-messages", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const filtered = filter === "all" ? messages : messages?.filter((m) => m.type === filter);

  const handleSelect = async (msg: any) => {
    setSelected(msg);
    if (!msg.read) {
      await supabase.from("messages").update({ read: true }).eq("id", msg.id);
      queryClient.invalidateQueries({ queryKey: ["dist-messages"] });
      queryClient.invalidateQueries({ queryKey: ["dist-unread"] });
    }
  };

  return (
    <DistributorLayout title="Messages" subtitle="Notifications and communications">
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["all", "announcement", "order", "support", "general"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {filtered?.map((msg) => {
              const Icon = typeIcons[msg.type] ?? Bell;
              return (
                <button
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left bg-card rounded-xl border p-4 hover:shadow-card transition-all ${
                    selected?.id === msg.id ? "border-primary" : "border-border"
                  } ${!msg.read ? "border-l-4 border-l-primary" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColors[msg.type] ?? typeColors.general}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${!msg.read ? "font-semibold text-foreground" : "text-foreground"}`}>{msg.subject}</p>
                        {!msg.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{msg.from_name} · {new Date(msg.created_at).toLocaleDateString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{msg.preview}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {(!filtered || filtered.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No messages in this category.</p>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                <div className="flex items-start gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[selected.type] ?? typeColors.general}`}>
                    {(() => { const Icon = typeIcons[selected.type] ?? Bell; return <Icon className="h-5 w-5" />; })()}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-lg font-semibold text-foreground">{selected.subject}</h2>
                    <p className="text-sm text-muted-foreground">From {selected.from_name} · {new Date(selected.created_at).toLocaleDateString("en-IN")}</p>
                  </div>
                  {selected.read ? <MailOpen className="h-5 w-5 text-muted-foreground" /> : <Mail className="h-5 w-5 text-primary" />}
                </div>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p>{selected.body || selected.preview}</p>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
                <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a message to view its contents</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DistributorLayout>
  );
};

export default Messages;
