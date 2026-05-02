import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, BadgeCheck } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const testimonials = [
  {
    quote: {
      en: "Shree Balaji Agro Industries has been our trusted partner for over 8 years. Their product quality and consistency are unmatched in the industry.",
      hi: "श्री बालाजी एग्रो इंडस्ट्रीज़ 8 वर्षों से अधिक समय से हमारा विश्वसनीय भागीदार रहा है। उनके उत्पाद की गुणवत्ता और निरंतरता उद्योग में बेजोड़ है।",
      mr: "श्री बालाजी अ‍ॅग्रो इंडस्ट्रीज 8 वर्षांहून अधिक काळ आमचा विश्वासू भागीदार आहे. त्यांच्या उत्पादनाची गुणवत्ता आणि सातत्य उद्योगात अतुलनीय आहे.",
    },
    name: "Mahendra Shet Bhandari",
    role: { en: "Distributor, Maharashtra", hi: "वितरक, महाराष्ट्र", mr: "वितरक, महाराष्ट्र" },
    verified: { en: "Verified Distributor", hi: "सत्यापित वितरक", mr: "सत्यापित वितरक" },
  },
  {
    quote: {
      en: "The range of crop protection products and the technical support provided by the team has significantly improved our farming yields.",
      hi: "टीम द्वारा प्रदान किए गए फसल सुरक्षा उत्पादों की श्रृंखला और तकनीकी सहायता ने हमारी कृषि उपज में काफी सुधार किया है।",
      mr: "टीमने पुरवलेल्या पीक संरक्षण उत्पादनांची श्रेणी आणि तांत्रिक सहाय्यामुळे आमच्या शेतीच्या उत्पादनात लक्षणीय सुधारणा झाली आहे.",
    },
    name: "Badhiram Dhudhane",
    role: { en: "Progressive Farmer, Maharashtra", hi: "प्रगतिशील किसान, महाराष्ट्र", mr: "प्रगतिशील शेतकरी, महाराष्ट्र" },
    verified: { en: "Verified Farmer", hi: "सत्यापित किसान", mr: "सत्यापित शेतकरी" },
  },
  {
    quote: {
      en: "Excellent supply chain management and timely delivery. They understand the urgency of agricultural seasons and never let us down.",
      hi: "उत्कृष्ट आपूर्ति श्रृंखला प्रबंधन और समय पर डिलीवरी। वे कृषि मौसम की तात्कालिकता को समझते हैं और कभी निराश नहीं करते।",
      mr: "उत्कृष्ट पुरवठा साखळी व्यवस्थापन आणि वेळेवर वितरण. ते शेती हंगामाची निकड समजून घेतात आणि आम्हाला कधीही निराश करत नाहीत.",
    },
    name: "Madhav Kadam",
    role: { en: "Dealer, Maharashtra", hi: "डीलर, महाराष्ट्र", mr: "विक्रेता, महाराष्ट्र" },
    verified: { en: "Verified Dealer", hi: "सत्यापित डीलर", mr: "सत्यापित विक्रेता" },
  },
];

const TestimonialsSection = () => {
  const { lang, t } = useI18n();
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const item = testimonials[current];
  const initials = item.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t("test.eyebrow")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("test.title")}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card text-center relative">
            <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" />
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
              "{item.quote[lang]}"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-heading font-bold text-base shadow-card">
                {initials}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="font-heading font-semibold text-foreground">{item.name}</p>
                  <BadgeCheck className="h-4 w-4 text-primary" aria-label={item.verified[lang]} />
                </div>
                <p className="text-xs text-muted-foreground">{item.role[lang]}</p>
                <p className="text-[11px] font-medium text-primary mt-0.5">{item.verified[lang]}</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={prev}
                className="p-2 rounded-full border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors"
                aria-label={t("test.prev")}
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
                aria-label={t("test.next")}
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
