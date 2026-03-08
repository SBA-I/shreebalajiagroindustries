import { useState } from "react";
import DistributorLayout from "@/components/distributor/DistributorLayout";
import { mockMessages, type Message } from "@/data/distributor";
import { Mail, MailOpen, Bell, ShoppingCart, MessageSquare, Megaphone } from "lucide-react";

const typeIcons: Record<Message["type"], React.ElementType> = {
  support: MessageSquare,
  announcement: Megaphone,
  order: ShoppingCart,
  general: Bell,
};

const typeColors: Record<Message["type"], string> = {
  support: "text-blue-600 bg-blue-50",
  announcement: "text-primary bg-primary/10",
  order: "text-secondary bg-secondary/10",
  general: "text-muted-foreground bg-muted",
};

const Messages = () => {
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState<Message["type"] | "all">("all");

  const filtered = filter === "all" ? mockMessages : mockMessages.filter((m) => m.type === filter);

  return (
    <DistributorLayout title="Messages" subtitle="Notifications and communications">
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(["all", "announcement", "order", "support", "general"] as const).map((t) => (
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.map((msg) => {
            const Icon = typeIcons[msg.type];
            return (
              <button
                key={msg.id}
                onClick={() => setSelected(msg)}
                className={`w-full text-left bg-card rounded-xl border p-4 hover:shadow-card transition-all ${
                  selected?.id === msg.id ? "border-primary" : "border-border"
                } ${!msg.read ? "border-l-4 border-l-primary" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColors[msg.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!msg.read ? "font-semibold text-foreground" : "text-foreground"}`}>{msg.subject}</p>
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{msg.from} · {msg.date}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{msg.preview}</p>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No messages in this category.</p>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <div className="flex items-start gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[selected.type]}`}>
                  {(() => { const Icon = typeIcons[selected.type]; return <Icon className="h-5 w-5" />; })()}
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-lg font-semibold text-foreground">{selected.subject}</h2>
                  <p className="text-sm text-muted-foreground">From {selected.from} · {selected.date}</p>
                </div>
                {selected.read ? <MailOpen className="h-5 w-5 text-muted-foreground" /> : <Mail className="h-5 w-5 text-primary" />}
              </div>
              <div className="prose prose-sm max-w-none text-foreground">
                <p>{selected.preview}</p>
                <p className="text-muted-foreground mt-4">
                  This is a preview of the message content. Full messaging functionality will be available once backend integration is complete.
                </p>
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
    </DistributorLayout>
  );
};

export default Messages;
