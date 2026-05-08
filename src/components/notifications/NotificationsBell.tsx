import { useEffect, useState } from "react";
import { Bell, Check, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Message = {
  id: string;
  user_id: string;
  from_name: string;
  subject: string;
  preview: string | null;
  body: string | null;
  type: string;
  read: boolean;
  created_at: string;
};

const NotificationsBell = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const unread = items.filter((m) => !m.read).length;

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data ?? []) as Message[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const channel = supabase
      .channel(`messages-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const msg = payload.new as Message;
          setItems((prev) => [msg, ...prev].slice(0, 20));
          toast(msg.subject, { description: msg.preview ?? undefined });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    await supabase.from("messages").update({ read: true }).eq("id", id);
  };

  const markAllRead = async () => {
    if (!user) return;
    setItems((prev) => prev.map((m) => ({ ...m, read: true })));
    await supabase.from("messages").update({ read: true }).eq("user_id", user.id).eq("read", false);
  };

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
    await supabase.from("messages").delete().eq("id", id);
  };

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full text-[10px]" variant="destructive">
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <p className="font-semibold text-sm">Notifications</p>
          {unread > 0 && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={markAllRead}>
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No notifications yet</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((m) => (
                <li
                  key={m.id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${!m.read ? "bg-primary/5" : ""}`}
                  onClick={() => !m.read && markRead(m.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{m.subject}</p>
                      {m.preview && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{m.preview}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {m.from_name} · {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      className="text-muted-foreground hover:text-destructive p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(m.id);
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsBell;