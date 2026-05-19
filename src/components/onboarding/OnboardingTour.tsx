import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type Tour = { key: string; pathPrefix: string; title: string; description: string; tips: string[] };

const TOURS: Tour[] = [
  {
    key: "tour.farmer.v1",
    pathPrefix: "/farmer",
    title: "Welcome, farmer!",
    description: "Quick tour of what you can do here.",
    tips: [
      "🌾 Log your crops and track spray history with safe harvest dates",
      "📷 Snap a leaf photo — our AI suggests the right product instantly",
      "🧮 Use the spray calculator to get exact dosage for your tank size",
      "🌦 Check weather, pest calendar and first-aid info anytime",
    ],
  },
  {
    key: "tour.distributor.v1",
    pathPrefix: "/distributor",
    title: "Welcome, distributor!",
    description: "Manage your shop in one place.",
    tips: [
      "📦 Update stock so farmers in your area can see availability",
      "🧾 View your invoices and dispatches from the brand",
      "🎨 Download marketing material — banners, brochures, social posts",
      "📍 Track package shipments end-to-end",
    ],
  },
  {
    key: "tour.field_officer.v1",
    pathPrefix: "/field-officer",
    title: "Welcome, field officer!",
    description: "Your daily field workflow.",
    tips: [
      "📍 Check in with GPS at the start of your day",
      "👥 Log farmer visits with photos, observations and product recommendations",
      "🏪 Audit dealer outlets and capture marketing needs",
      "📝 Add new farmer leads — admin and dealers see them instantly",
    ],
  },
  {
    key: "tour.admin.v1",
    pathPrefix: "/admin",
    title: "Welcome to the Admin Portal",
    description: "Everything is grouped into tabs at the top.",
    tips: [
      "📊 Start in Overview for KPIs and recent inquiries",
      "✅ Verification tab is where you approve dealers & field officers",
      "📈 Analytics tab shows invoice trends, top dealers and lead pipeline",
      "📜 Audit Log records sensitive admin actions for accountability",
    ],
  },
];

const OnboardingTour = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [tour, setTour] = useState<Tour | null>(null);

  useEffect(() => {
    const match = TOURS.find((t) => location.pathname.startsWith(t.pathPrefix));
    if (!match) { setOpen(false); return; }
    if (localStorage.getItem(match.key) === "done") return;
    setTour(match);
    setOpen(true);
  }, [location.pathname]);

  const dismiss = () => {
    if (tour) localStorage.setItem(tour.key, "done");
    setOpen(false);
  };

  if (!tour) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>{tour.title}</DialogTitle>
          <DialogDescription>{tour.description}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm py-2">
          {tour.tips.map((tip, i) => <li key={i} className="leading-relaxed">{tip}</li>)}
        </ul>
        <DialogFooter>
          <Button onClick={dismiss} className="w-full">Got it, let's go</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;