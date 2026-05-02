import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditDialog from "./EditDialog";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
interface Row { id: string; pest_name: string; crop: string; season: string; active_months: number[]; severity: string; preventive_tips: string | null; }
const blank = { pest_name: "", crop: "", season: "Kharif", severity: "medium", preventive_tips: "", active_months: [] as number[] };

const AdminPestCalendarManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("pest_calendar").select("*").order("crop");
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const toggleMonth = (m: number) => {
    setForm((f) => ({ ...f, active_months: f.active_months.includes(m) ? f.active_months.filter((x) => x !== m) : [...f.active_months, m].sort((a, b) => a - b) }));
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pest_name || !form.crop || form.active_months.length === 0) return toast.error("Fill name, crop and pick at least one month");
    setBusy(true);
    const { error } = await supabase.from("pest_calendar").insert({
      pest_name: form.pest_name, crop: form.crop, season: form.season, severity: form.severity,
      preventive_tips: form.preventive_tips || null, active_months: form.active_months, region: "Maharashtra",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Pest entry added");
    setForm(blank);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await supabase.from("pest_calendar").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Add pest entry</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <div><Label>Pest name *</Label><Input value={form.pest_name} onChange={(e) => setForm({ ...form, pest_name: e.target.value })} /></div>
              <div><Label>Crop *</Label><Input value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} /></div>
              <div>
                <Label>Season</Label>
                <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Kharif">Kharif</SelectItem><SelectItem value="Rabi">Rabi</SelectItem><SelectItem value="Zaid">Zaid</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Active months *</Label>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mt-1">
                {MONTHS.map((m, i) => {
                  const month = i + 1;
                  const active = form.active_months.includes(month);
                  return (
                    <button key={m} type="button" onClick={() => toggleMonth(month)}
                      className={`text-xs py-1.5 rounded-md border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"}`}>{m}</button>
                  );
                })}
              </div>
            </div>
            <div><Label>Preventive tips</Label><Textarea rows={2} value={form.preventive_tips} onChange={(e) => setForm({ ...form, preventive_tips: e.target.value })} /></div>
            <div className="flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Entries ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.pest_name} <span className="text-muted-foreground font-normal">— {r.crop}</span></p>
                    <p className="text-xs text-muted-foreground">{r.season} · {r.severity} · months {r.active_months.join(", ")}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  <EditPestButton row={r} onSaved={refresh} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPestCalendarManager;

const EditPestButton = ({ row, onSaved }: { row: Row; onSaved: () => void }) => {
  const [draft, setDraft] = useState({
    pest_name: row.pest_name, crop: row.crop, season: row.season, severity: row.severity,
    preventive_tips: row.preventive_tips ?? "", active_months: row.active_months ?? [],
  });
  const toggle = (m: number) =>
    setDraft((d) => ({ ...d, active_months: d.active_months.includes(m) ? d.active_months.filter((x) => x !== m) : [...d.active_months, m].sort((a, b) => a - b) }));
  const save = async () => {
    const { error } = await supabase.from("pest_calendar").update({
      pest_name: draft.pest_name, crop: draft.crop, season: draft.season, severity: draft.severity,
      preventive_tips: draft.preventive_tips || null, active_months: draft.active_months,
    }).eq("id", row.id);
    if (error) { toast.error(error.message); return false; }
    toast.success("Updated");
    onSaved();
  };
  return (
    <EditDialog title={`Edit ${row.pest_name}`} onSave={save}>
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Pest name</Label><Input value={draft.pest_name} onChange={(e) => setDraft({ ...draft, pest_name: e.target.value })} /></div>
        <div><Label>Crop</Label><Input value={draft.crop} onChange={(e) => setDraft({ ...draft, crop: e.target.value })} /></div>
        <div>
          <Label>Season</Label>
          <Select value={draft.season} onValueChange={(v) => setDraft({ ...draft, season: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Kharif">Kharif</SelectItem><SelectItem value="Rabi">Rabi</SelectItem><SelectItem value="Zaid">Zaid</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label>Severity</Label>
          <Select value={draft.severity} onValueChange={(v) => setDraft({ ...draft, severity: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Active months</Label>
        <div className="grid grid-cols-6 gap-1 mt-1">
          {MONTHS.map((m, i) => {
            const month = i + 1;
            const active = draft.active_months.includes(month);
            return (
              <button key={m} type="button" onClick={() => toggle(month)}
                className={`text-xs py-1.5 rounded-md border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"}`}>{m}</button>
            );
          })}
        </div>
      </div>
      <div><Label>Preventive tips</Label><Textarea rows={2} value={draft.preventive_tips} onChange={(e) => setDraft({ ...draft, preventive_tips: e.target.value })} /></div>
    </EditDialog>
  );
};