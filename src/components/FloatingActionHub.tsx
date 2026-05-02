import { useState } from "react";
import { Plus, X, MessageCircle, AlertOctagon, AlertTriangle, Mail } from "lucide-react";
import whatsappIcon from "@/assets/whatsapp-icon.svg";
import AiChatWidget from "@/components/ai/AiChatWidget";
import EmergencyFirstAidButton from "@/components/safety/EmergencyFirstAidButton";
import EmergencyContactButton from "@/components/safety/EmergencyContactButton";

type PanelKey = "ai" | "firstaid" | "contact" | null;

const FloatingActionHub = () => {
  const [expanded, setExpanded] = useState(false);
  const [panel, setPanel] = useState<PanelKey>(null);

  const openPanel = (key: PanelKey) => {
    setPanel(key);
    setExpanded(false);
  };

  const anyPanelOpen = panel !== null;

  // Common mini-button styles
  const mini =
    "flex h-11 w-11 items-center justify-center rounded-full shadow-elevated hover:scale-105 transition-transform";

  return (
    <>
      {/* Controlled panels */}
      <AiChatWidget hideTrigger open={panel === "ai"} onOpenChange={(o) => setPanel(o ? "ai" : null)} />
      <EmergencyFirstAidButton hideTrigger open={panel === "firstaid"} onOpenChange={(o) => setPanel(o ? "firstaid" : null)} />
      <EmergencyContactButton hideTrigger open={panel === "contact"} onOpenChange={(o) => setPanel(o ? "contact" : null)} />

      {/* Hide hub when a full panel is open to avoid overlap */}
      {!anyPanelOpen && (
        <div className="fixed bottom-4 right-3 z-50 flex flex-col items-end gap-2">
          {expanded && (
            <div className="flex flex-col items-end gap-2 animate-fade-in">
              <button
                onClick={() => openPanel("ai")}
                className={`${mini} bg-primary text-primary-foreground`}
                aria-label="Ask AI Assistant"
                title="Ask AI"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => openPanel("firstaid")}
                className={`${mini} bg-destructive text-destructive-foreground`}
                aria-label="Emergency First-Aid"
                title="First-Aid"
              >
                <AlertOctagon className="h-5 w-5" />
              </button>
              <button
                onClick={() => openPanel("contact")}
                className={`${mini} bg-destructive text-destructive-foreground`}
                aria-label="Emergency Contacts"
                title="Emergency Contacts"
              >
                <AlertTriangle className="h-5 w-5" />
              </button>
              <a
                href="https://wa.me/917744998998"
                target="_blank"
                rel="noopener noreferrer"
                className={`${mini} bg-[#25D366]`}
                aria-label="Chat on WhatsApp"
                title="WhatsApp"
              >
                <img src={whatsappIcon} alt="" className="h-6 w-6" />
              </a>
              <a
                href="mailto:sbaindia44@gmail.com"
                className={`${mini} bg-secondary text-secondary-foreground`}
                aria-label="Email us"
                title="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            aria-label={expanded ? "Close quick actions" : "Open quick actions"}
            aria-expanded={expanded}
          >
            {expanded ? <X className="h-5 w-5" /> : <Plus className="h-6 w-6" />}
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingActionHub;
