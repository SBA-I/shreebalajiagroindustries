import { useState } from "react";
import FarmerLayout from "@/components/farmer/FarmerLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MessageSquare, CheckCircle } from "lucide-react";

const AskQuestion = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { toast.error("Please describe your problem"); return; }
    setLoading(true);

    const { error } = await supabase.from("contact_inquiries").insert({
      name: name || "Farmer",
      email: user?.email || "farmer@sbai.local",
      message: message.trim(),
      inquiry_type: "crop_problem",
    });

    setLoading(false);
    if (error) {
      toast.error("Failed to submit. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Question submitted! Our team will respond soon.");
    }
  };

  if (submitted) {
    return (
      <FarmerLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Question Submitted!</h2>
          <p className="text-muted-foreground mb-6">Our agri experts will review your question and get back to you.</p>
          <Button onClick={() => { setSubmitted(false); setMessage(""); setName(""); }} variant="outline">
            Ask Another Question
          </Button>
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Ask Crop Problem</h1>
        <p className="text-muted-foreground mb-6">Describe your crop issue and our experts will recommend a solution</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Your Name</label>
            <Input placeholder="e.g. Ramesh" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Describe your crop problem *</label>
            <Textarea
              placeholder="e.g. My cotton crop has white insects on the leaves. What pesticide should I use?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
            Submit Question
          </Button>
        </form>
      </div>
    </FarmerLayout>
  );
};

export default AskQuestion;
