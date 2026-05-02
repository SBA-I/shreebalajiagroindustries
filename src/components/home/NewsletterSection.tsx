import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing!");
      setEmail("");
    }
  };

  return (
    <section
      className="py-16"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--forest)) 0%, hsl(120 45% 22%) 100%)",
      }}
    >
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
          Stay Updated with Agricultural Insights
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
          Subscribe to our newsletter for the latest product updates, farming tips, and industry news.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60"
            required
          />
          <Button type="submit" variant="hero" className="gap-2 shrink-0">
            Subscribe
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
