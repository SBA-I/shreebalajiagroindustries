import { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bug, ListChecks, MessageCircle, ShieldAlert } from "lucide-react";
import {
  CROP_PROGRAMS,
  MONTHS_SHORT,
  pressureColor,
  pressureLabel,
  type CropStage,
} from "@/data/agronomy";

const STAGES: CropStage[] = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Maturity"];

const severityBadge = (s: "low" | "medium" | "high") => {
  if (s === "high") return "bg-destructive text-destructive-foreground";
  if (s === "medium") return "bg-accent text-accent-foreground";
  return "bg-primary/20 text-primary";
};

const WHATSAPP = "https://wa.me/919999999999"; // brand WhatsApp placeholder

const PestCalendar = () => {
  const [cropName, setCropName] = useState<string>(CROP_PROGRAMS[0].crop);
  const [stageIdx, setStageIdx] = useState<number>(0);

  const program = useMemo(
    () => CROP_PROGRAMS.find((p) => p.crop === cropName) ?? CROP_PROGRAMS[0],
    [cropName],
  );

  const stage = STAGES[stageIdx];
  const stagePests = program.stages[stage] ?? [];
  const currentMonth = new Date().getMonth();
  const currentPressure = program.monthlyPressure[currentMonth];

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary/80 py-12">
        <div className="container mx-auto px-4 lg:px-8 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Bug className="h-8 w-8" />
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">Pest Calendar</h1>
              <p className="text-primary-foreground/80 text-sm md:text-base mt-1">
                Crop-stage and seasonal pest pressure for Maharashtra. Plan scouting, prevent loss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's pressure banner */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-wrap items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <span className="text-sm">
            <strong>{program.crop}</strong> pest pressure this month ({MONTHS_SHORT[currentMonth]}):
          </span>
          <Badge className={pressureColor(currentPressure)}>{pressureLabel(currentPressure)}</Badge>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl space-y-8">
          {/* Crop selector */}
          <Tabs value={cropName} onValueChange={(v) => { setCropName(v); setStageIdx(0); }}>
            <TabsList className="flex-wrap h-auto">
              {CROP_PROGRAMS.map((p) => (
                <TabsTrigger key={p.crop} value={p.crop}>{p.crop}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Stage slider */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Crop Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {STAGES.map((s, i) => (
                  <span key={s} className={i === stageIdx ? "font-semibold text-primary" : ""}>
                    {s}
                  </span>
                ))}
              </div>
              <Slider
                min={0}
                max={STAGES.length - 1}
                step={1}
                value={[stageIdx]}
                onValueChange={(v) => setStageIdx(v[0])}
              />
              <div className="text-center">
                <Badge variant="outline" className="text-sm font-semibold">{stage}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pests in stage */}
          <div>
            <h2 className="font-heading text-xl font-bold mb-3">Pests active during {stage}</h2>
            {stagePests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No major pest pressure recorded for this stage.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {stagePests.map((p) => (
                  <Card key={p.pest}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-heading font-semibold">{p.pest}</h3>
                          {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                        </div>
                        <Badge className={severityBadge(p.severity)}>{p.severity}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {p.treatmentProductName && (
                          <Button size="sm" asChild>
                            <a href={`/products?search=${encodeURIComponent(p.treatmentProductName)}`}>
                              View Treatment: {p.treatmentProductName}
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`${WHATSAPP}?text=${encodeURIComponent(`Hello, I need help with ${p.pest} on ${program.crop}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Enquire on WhatsApp
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Peak Pressure Heatmap (Maharashtra)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-1 text-center">
                {MONTHS_SHORT.map((m, i) => (
                  <div key={m} className="space-y-1">
                    <div className="text-[10px] text-muted-foreground">{m}</div>
                    <div
                      className={`rounded h-10 flex items-center justify-center text-[10px] font-semibold ${pressureColor(program.monthlyPressure[i])} ${i === currentMonth ? "ring-2 ring-primary" : ""}`}
                      title={pressureLabel(program.monthlyPressure[i])}
                    >
                      {pressureLabel(program.monthlyPressure[i])[0]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4 text-xs flex-wrap">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive inline-block" /> Peak</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent inline-block" /> High</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/30 inline-block" /> Low</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted inline-block" /> None</span>
              </div>
            </CardContent>
          </Card>

          {/* Scouting checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" /> Scouting Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {program.scoutingChecklist.map((c) => (
                  <li key={c.month} className="flex gap-3 p-3 rounded-md border border-border">
                    <Badge variant="outline" className="shrink-0 self-start">{c.month}</Badge>
                    <span className="text-sm">{c.task}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default PestCalendar;