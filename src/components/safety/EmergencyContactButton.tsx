import { useEffect, useState } from "react";
import { Phone, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  hideTrigger?: boolean;
}

const EmergencyContactButton = ({ open: openProp, onOpenChange, hideTrigger }: Props = {}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setOpenState(v));

  return (
    <>
      {!hideTrigger && (
        <div className="fixed bottom-[10.75rem] right-3 z-40">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Emergency contact"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-elevated hover:scale-105 transition-transform"
          >
            {open ? <X className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </button>
        </div>
      )}

      {open && (
        <Card className="fixed bottom-20 right-3 z-50 w-72 p-4 shadow-elevated animate-fade-in border-destructive/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-heading font-semibold text-sm">Emergency Contacts</h3>
            <button onClick={() => setOpen(false)} className="ml-auto p-1 hover:bg-muted rounded" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            For accidental exposure, ingestion or spills, call immediately.
          </p>
          <div className="space-y-2">
            <a
              href="tel:1800118600"
              className="flex items-center justify-between p-2 rounded-md bg-destructive/5 hover:bg-destructive/10 transition-colors"
            >
              <div>
                <p className="text-xs font-semibold">National Poison Helpline</p>
                <p className="text-[11px] text-muted-foreground">24×7</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                <Phone className="h-3 w-3" /> 1800-11-8600
              </span>
            </a>
            <a
              href="tel:108"
              className="flex items-center justify-between p-2 rounded-md bg-muted hover:bg-muted/70 transition-colors"
            >
              <div>
                <p className="text-xs font-semibold">Ambulance</p>
                <p className="text-[11px] text-muted-foreground">India emergency</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium">
                <Phone className="h-3 w-3" /> 108
              </span>
            </a>
            <a
              href="tel:+917744998998"
              className="flex items-center justify-between p-2 rounded-md bg-muted hover:bg-muted/70 transition-colors"
            >
              <div>
                <p className="text-xs font-semibold">Balaji Helpdesk</p>
                <p className="text-[11px] text-muted-foreground">Mon–Sat 9–6</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium">
                <Phone className="h-3 w-3" /> 77449 98998
              </span>
            </a>
          </div>
        </Card>
      )}
    </>
  );
};

export default EmergencyContactButton;