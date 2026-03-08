import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Shree Balaji Agro Industries has been our trusted partner for over 8 years. Their product quality and consistency are unmatched in the industry.",
    name: "Rajesh Patel",
    role: "Distributor, Gujarat",
  },
  {
    quote: "The range of crop protection products and the technical support provided by the team has significantly improved our farming yields.",
    name: "Suresh Kumar",
    role: "Progressive Farmer, Maharashtra",
  },
  {
    quote: "Excellent supply chain management and timely delivery. They understand the urgency of agricultural seasons and never let us down.",
    name: "Anil Sharma",
    role: "Dealer, Rajasthan",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Testimonials</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            What Our Partners Say
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card text-center relative">
            <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" />
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
              "{t.quote}"
            </p>
            <div>
              <p className="font-heading font-semibold text-foreground">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>

            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={prev}
                className="p-2 rounded-full border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="p-2 rounded-full border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
