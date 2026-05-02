import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, X, AlertOctagon, AlertTriangle, Mail,
  Calculator, Camera, TrendingUp, Timer, Bug, MapPin, Sparkles,
} from "lucide-react";
import whatsappIcon from "@/assets/whatsapp-icon.svg";
import AiChatWidget from "@/components/ai/AiChatWidget";
import SprayCalculator from "@/components/ai/SprayCalculator";
import CropImageDetector from "@/components/ai/CropImageDetector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmergencyFirstAidButton from "@/components/safety/EmergencyFirstAidButton";
import EmergencyContactButton from "@/components/safety/EmergencyContactButton";
import { useI18n } from "@/i18n/I18nProvider";

type PanelKey = "ai" | "spray" | "disease" | "firstaid" | "contact" | null;

interface ActionItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  bg: string; // tailwind bg + text classes
  onClick?: () => void;
  to?: string;
  href?: string;
  external?: boolean;
}

const FloatingActionHub = () => {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [panel, setPanel] = useState<PanelKey>(null);

  const openPanel = (key: PanelKey) => {
    setPanel(key);
    setExpanded(false);
  };

  const close = () => setExpanded(false);

  const actions: ActionItem[] = [
    { key: "ai", label: t("fab.ai"), icon: <Sparkles className="h-5 w-5" />, bg: "bg-primary text-primary-foreground", onClick: () => openPanel("ai") },
    { key: "spray", label: t("fab.spray"), icon: <Calculator className="h-5 w-5" />, bg: "bg-primary text-primary-foreground", onClick: () => openPanel("spray") },
    { key: "disease", label: t("fab.disease"), icon: <Camera className="h-5 w-5" />, bg: "bg-accent text-accent-foreground", onClick: () => openPanel("disease") },
    { key: "firstaid", label: t("fab.firstaid"), icon: <AlertOctagon className="h-5 w-5" />, bg: "bg-destructive text-destructive-foreground", onClick: () => openPanel("firstaid") },
    { key: "contact", label: t("fab.emergency"), icon: <AlertTriangle className="h-5 w-5" />, bg: "bg-destructive text-destructive-foreground", onClick: () => openPanel("contact") },
    { key: "profit", label: t("fab.profit"), icon: <TrendingUp className="h-5 w-5" />, bg: "bg-secondary text-secondary-foreground", to: "/yield-simulator" },
    { key: "harvest", label: t("fab.harvest"), icon: <Timer className="h-5 w-5" />, bg: "bg-secondary text-secondary-foreground", to: "/tools/harvest-timer" },
    { key: "pest", label: t("fab.pest"), icon: <Bug className="h-5 w-5" />, bg: "bg-secondary text-secondary-foreground", to: "/tools/pest-calendar" },
    { key: "dealer", label: t("fab.dealer"), icon: <MapPin className="h-5 w-5" />, bg: "bg-primary text-primary-foreground", to: "/dealers" },
    { key: "wa", label: t("fab.wa"), icon: <img src={whatsappIcon} alt="" className="h-5 w-5" />, bg: "bg-[#25D366] text-white", href: "https://wa.me/917744998998", external: true },
    { key: "email", label: t("fab.email"), icon: <Mail className="h-5 w-5" />, bg: "bg-muted text-foreground", href: "mailto:sbaindia44@gmail.com" },
  ];

  const renderTile = (a: ActionItem) => {
    const inner = (
      <div className="flex flex-col items-center gap-1.5">
        <span className={`flex h-12 w-12 items-center justify-center rounded-full shadow-md ${a.bg}`}>
          {a.icon}
        </span>
        <span className="text-[11px] font-medium text-foreground text-center leading-tight">{a.label}</span>
      </div>
    );
    if (a.to) {
      return (
        <Link key={a.key} to={a.to} onClick={close} className="hover:scale-105 transition-transform">
          {inner}
        </Link>
      );
    }
    if (a.href) {
      return (
        <a
          key={a.key}
          href={a.href}
          target={a.external ? "_blank" : undefined}
          rel={a.external ? "noopener noreferrer" : undefined}
          onClick={close}
          className="hover:scale-105 transition-transform"
        >
          {inner}
        </a>
      );
    }
    return (
      <button key={a.key} onClick={a.onClick} className="hover:scale-105 transition-transform">
        {inner}
      </button>
    );
  };

  const anyPanelOpen = panel !== null;

  return (
    <>
      {/* Controlled panels */}
      <AiChatWidget hideTrigger open={panel === "ai"} onOpenChange={(o) => setPanel(o ? "ai" : null)} />
      <Dialog open={panel === "spray"} onOpenChange={(o) => setPanel(o ? "spray" : null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("fab.sprayDialog")}</DialogTitle>
          </DialogHeader>
          <SprayCalculator />
        </DialogContent>
      </Dialog>
      <Dialog open={panel === "disease"} onOpenChange={(o) => setPanel(o ? "disease" : null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("fab.diseaseDialog")}</DialogTitle>
          </DialogHeader>
          <CropImageDetector />
        </DialogContent>
      </Dialog>
      <EmergencyFirstAidButton hideTrigger open={panel === "firstaid"} onOpenChange={(o) => setPanel(o ? "firstaid" : null)} />
      <EmergencyContactButton hideTrigger open={panel === "contact"} onOpenChange={(o) => setPanel(o ? "contact" : null)} />

      {!anyPanelOpen && (
        <>
          {/* Backdrop */}
          {expanded && (
            <button
              type="button"
              aria-label="Close quick actions"
              onClick={close}
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[2px] animate-fade-in"
            />
          )}

          {/* Grouped panel */}
          {expanded && (
            <div className="fixed bottom-20 right-3 z-50 w-[280px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-card shadow-elevated p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-heading font-semibold text-foreground">{t("fab.title")}</p>
                <button onClick={close} className="p-1 hover:bg-muted rounded" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {actions.map(renderTile)}
              </div>
            </div>
          )}

          {/* Main FAB */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="fixed bottom-4 right-3 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            aria-label={expanded ? "Close quick actions" : "Open quick actions"}
            aria-expanded={expanded}
          >
            {expanded ? <X className="h-6 w-6" /> : <Plus className="h-7 w-7" />}
          </button>
        </>
      )}
    </>
  );
};

export default FloatingActionHub;
