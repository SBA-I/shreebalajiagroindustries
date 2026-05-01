export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  category: ArticleCategory;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  type: "article" | "video" | "guide";
}

export type ArticleCategory = "crop-protection" | "application" | "safety" | "ipm" | "seasonal" | "soil-health";

export const articleCategoryLabels: Record<ArticleCategory, string> = {
  "crop-protection": "Crop Protection",
  "application": "Application Techniques",
  "safety": "Safety & Handling",
  "ipm": "Integrated Pest Management",
  "seasonal": "Seasonal Advisory",
  "soil-health": "Soil Health",
};

export const articles: Article[] = [
  {
    id: "art-001",
    title: "Complete Guide to Choosing the Right Pesticide for Your Crops",
    slug: "choosing-right-pesticide",
    excerpt: "A comprehensive guide covering how to identify pest problems, select appropriate pesticides, and apply them effectively for maximum crop protection.",
    content: [
      "Choosing the right pesticide is one of the most critical decisions a farmer makes each season. An incorrect choice can lead to crop damage, environmental harm, and financial loss. This guide walks you through a systematic approach to pesticide selection.",
      "**Step 1: Identify the Pest or Disease** — Before selecting any pesticide, accurately identify the pest causing damage. Look for visual symptoms on leaves, stems, and roots. Consider consulting local agricultural extension officers or using mobile pest identification apps for confirmation.",
      "**Step 2: Understand Pesticide Categories** — Pesticides are broadly classified into insecticides (for insect pests), fungicides (for fungal diseases), herbicides (for weeds), and plant growth regulators. Each category has sub-types with different modes of action.",
      "**Step 3: Consider the Crop Stage** — The growth stage of your crop determines which pesticides are safe to use. Some chemicals can damage crops at flowering or fruiting stages. Always check the label for crop stage compatibility.",
      "**Step 4: Check the Mode of Action** — Systemic pesticides are absorbed and transported within the plant, offering protection from inside. Contact pesticides work on the surface. Choose based on the pest's feeding behavior and the type of protection needed.",
      "**Step 5: Review Safety and Environmental Impact** — Consider the pesticide's toxicity class, pre-harvest interval, and impact on beneficial organisms. Always prefer products with lower environmental impact when equally effective options are available.",
      "**Step 6: Follow the Label** — The product label is the law. Always follow recommended dosages, application methods, safety precautions, and waiting periods before harvest.",
    ],
    category: "crop-protection",
    author: "Dr. Arvind Sharma",
    authorRole: "Chief Agronomist",
    date: "2026-03-01",
    readTime: "8 min read",
    tags: ["pesticide selection", "crop protection", "pest identification"],
    featured: true,
    type: "guide",
  },
  {
    id: "art-002",
    title: "Safe Application Practices for Agricultural Chemicals",
    slug: "safe-application-practices",
    excerpt: "Learn essential safety protocols for handling and applying pesticides, including PPE requirements, mixing procedures, and emergency response measures.",
    content: [
      "Agricultural chemical safety is paramount for protecting applicators, farm workers, consumers, and the environment. This guide outlines the essential safety practices every farmer and spray operator must follow.",
      "**Personal Protective Equipment (PPE)** — Always wear appropriate PPE including chemical-resistant gloves, protective eyewear, a respirator or face mask, long-sleeved clothing, and waterproof boots. PPE should be worn during mixing, loading, application, and equipment cleaning.",
      "**Mixing and Loading** — Always mix pesticides in well-ventilated areas. Use measuring cups dedicated for pesticide use only. Never use bare hands to handle concentrates. Add water to the tank first, then add the chemical to prevent splashing.",
      "**Application Best Practices** — Apply during calm weather conditions (wind speed below 10 km/h). Avoid spraying during rain or extreme heat. Spray in the early morning or late evening for best efficacy and to protect pollinators.",
      "**Post-Application Safety** — Keep people and animals away from treated areas for the specified re-entry interval. Wash all equipment thoroughly after use. Clean PPE separately from regular laundry. Dispose of empty containers safely according to local regulations.",
      "**Emergency Procedures** — In case of accidental exposure, remove contaminated clothing immediately and wash affected skin with soap and water. For eye exposure, flush with clean water for 15 minutes. Seek medical attention immediately and bring the product label.",
    ],
    category: "safety",
    author: "Vikram Desai",
    authorRole: "Safety Compliance Officer",
    date: "2026-02-20",
    readTime: "6 min read",
    tags: ["safety", "PPE", "chemical handling", "emergency response"],
    featured: true,
    type: "article",
  },
  {
    id: "art-003",
    title: "Seasonal Pest Calendar: Know When to Protect Your Crops",
    slug: "seasonal-pest-calendar",
    excerpt: "A month-by-month guide to common pest and disease threats across major crops in India, with recommended preventive measures.",
    content: [
      "Understanding the seasonal patterns of pests and diseases is key to effective crop protection. This calendar provides a general guide for major cropping seasons in India.",
      "**Kharif Season (June–October)** — During the monsoon, high humidity creates ideal conditions for fungal diseases like blast in rice, downy mildew in vegetables, and late blight in potato. Major insect pests include stem borers, leaf folders in rice, and bollworms in cotton.",
      "**Rabi Season (November–March)** — Winter crops face threats from aphids, termites, and rust diseases. Wheat is particularly vulnerable to yellow rust and brown rust. Mustard aphids can cause 30-40% yield loss if not managed early.",
      "**Zaid Season (March–June)** — Summer vegetables face intense whitefly, mite, and thrip pressure. Fruit flies become a major concern in cucurbit crops. The high temperatures can also increase virus transmission through insect vectors.",
      "**Pre-Monsoon Preparation (April–May)** — This is the ideal time for soil treatment against termites and white grubs. Pre-monsoon deep plowing exposes soil-dwelling pests to sunlight. Seed treatment should be planned for all Kharif crops.",
      "**Year-Round Vigilance** — Some pests like thrips, mealybugs, and certain soil-borne diseases persist year-round. Regular crop monitoring with at least weekly field scouting is essential for early detection and timely intervention.",
    ],
    category: "seasonal",
    author: "Dr. Arvind Sharma",
    authorRole: "Chief Agronomist",
    date: "2026-02-15",
    readTime: "7 min read",
    tags: ["seasonal pests", "kharif", "rabi", "crop calendar"],
    featured: false,
    type: "guide",
  },
  {
    id: "art-004",
    title: "Optimal Spraying Techniques for Maximum Coverage",
    slug: "spraying-techniques",
    excerpt: "Video tutorial and guide on spray nozzle selection, calibration, coverage patterns, and drift management for effective pesticide application.",
    content: [
      "Proper spraying technique is just as important as choosing the right pesticide. Poor application can waste chemical, harm the environment, and leave crops unprotected.",
      "**Nozzle Selection** — Flat fan nozzles are best for broadcast herbicide application. Hollow cone nozzles provide fine droplets ideal for fungicide and insecticide coverage on foliage. Use air-induction nozzles to reduce spray drift.",
      "**Calibration** — Before every spray season, calibrate your equipment. Mark a 100-meter strip, spray with water, and measure the output. Adjust pressure and speed to achieve the recommended spray volume per hectare.",
      "**Walking Speed and Height** — Maintain a consistent walking speed of about 3-4 km/h for knapsack sprayers. Keep the nozzle at the correct height (typically 45-60 cm above the target) for proper spray pattern overlap.",
      "**Drift Management** — Use the largest droplet size that gives adequate coverage. Add adjuvants to improve droplet behavior. Create buffer zones near water bodies and sensitive areas. Avoid spraying when wind exceeds 10 km/h.",
      "**Record Keeping** — Maintain a spray diary recording the date, product used, dosage, weather conditions, and equipment settings for each application. This helps optimize future applications and meets regulatory requirements.",
    ],
    category: "application",
    author: "Suresh Patil",
    authorRole: "Field Application Specialist",
    date: "2026-02-10",
    readTime: "5 min read",
    tags: ["spraying", "nozzles", "calibration", "application"],
    featured: false,
    type: "video",
  },
  {
    id: "art-005",
    title: "Integrated Pest Management: Combining Methods for Sustainable Farming",
    slug: "integrated-pest-management",
    excerpt: "Learn how to implement IPM strategies that combine biological, cultural, mechanical, and chemical methods for effective and sustainable pest control.",
    content: [
      "Integrated Pest Management (IPM) is a holistic approach that combines multiple pest management tactics to minimize pest damage while reducing reliance on chemical pesticides alone.",
      "**Cultural Controls** — Crop rotation breaks pest and disease cycles. Resistant varieties reduce the need for chemical treatments. Proper spacing improves air circulation and reduces fungal disease pressure. Timely sowing helps crops escape peak pest periods.",
      "**Biological Controls** — Encourage natural enemies like ladybird beetles (aphid predators), Trichogramma wasps (egg parasitoids), and predatory mites. Use bio-pesticides like Beauveria bassiana and Trichoderma for eco-friendly pest management.",
      "**Mechanical Controls** — Install pheromone traps to monitor and mass-trap male moths. Use yellow sticky traps for whiteflies and aphids. Light traps can capture night-flying moths. Hand-picking of egg masses and caterpillars is effective in small areas.",
      "**Chemical Controls as Last Resort** — When economic threshold levels are reached, use targeted chemical treatments. Select pesticides with narrow spectrum of activity to preserve natural enemies. Rotate chemical groups to prevent resistance development.",
      "**Monitoring and Decision Making** — Regular field scouting is the backbone of IPM. Use economic threshold levels (ETL) to decide when chemical intervention is necessary. Many pest populations can be kept below damaging levels by natural enemies alone.",
    ],
    category: "ipm",
    author: "Dr. Meena Gupta",
    authorRole: "IPM Specialist",
    date: "2026-01-28",
    readTime: "9 min read",
    tags: ["IPM", "biological control", "sustainable farming", "natural enemies"],
    featured: true,
    type: "article",
  },
  {
    id: "art-006",
    title: "Soil Health and Its Impact on Crop Protection",
    slug: "soil-health-crop-protection",
    excerpt: "Understanding the connection between soil health, plant immunity, and pest resistance. Healthy soil grows healthy, pest-resistant crops.",
    content: [
      "Soil health is the foundation of effective crop protection. Plants growing in healthy, biologically active soil develop stronger natural defense mechanisms against pests and diseases.",
      "**The Soil-Plant Health Connection** — Healthy soil provides balanced nutrition, promoting vigorous plant growth with stronger cell walls and enhanced production of natural defense compounds. Nutrient-deficient plants are more susceptible to pest attack.",
      "**Soil Microbiome** — A diverse soil microbiome suppresses soil-borne pathogens naturally. Beneficial fungi like mycorrhizae improve nutrient uptake and can trigger systemic resistance in plants. Bacillus and Pseudomonas bacteria produce compounds that inhibit pathogenic organisms.",
      "**Organic Matter Management** — Maintain soil organic matter above 2% through crop residue incorporation, compost application, and green manuring. Organic matter improves water retention, supports microorganism populations, and provides slow-release nutrition.",
      "**Soil Testing** — Regular soil testing reveals nutrient deficiencies that can make crops vulnerable to pests. Correct pH imbalances and micronutrient deficiencies before they compromise plant health. Test at least once per year, ideally before each major cropping season.",
      "**Conservation Practices** — Minimize soil disturbance through reduced tillage. Maintain soil cover with mulches or cover crops. Practice crop rotation to break disease cycles and improve soil structure over time.",
    ],
    category: "soil-health",
    author: "Dr. Priya Nair",
    authorRole: "Soil Scientist",
    date: "2026-01-15",
    readTime: "7 min read",
    tags: ["soil health", "microbiome", "organic matter", "plant immunity"],
    featured: false,
    type: "article",
  },
];

export const getArticleById = (id: string) => articles.find((a) => a.id === id);
export const getArticleBySlug = (slug: string) => articles.find((a) => a.slug === slug);

// News
export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  category: NewsCategory;
  date: string;
  author: string;
}

export type NewsCategory = "company" | "product" | "industry" | "advisory" | "achievement";

export const newsCategoryLabels: Record<NewsCategory, string> = {
  company: "Company News",
  product: "Product Launch",
  industry: "Industry Update",
  advisory: "Advisory",
  achievement: "Achievement",
};

export const newsArticles: NewsArticle[] = [
  {
    id: "news-001",
    title: "New Product Launch: BioGuard Plus – Our First Bio-Insecticide",
    slug: "bioguard-plus-launch",
    excerpt: "Introducing our latest broad-spectrum bio-insecticide based on Beauveria bassiana, designed for sustainable and organic farming practices.",
    content: [
      "Shree Balaji Agro Industries is proud to announce the launch of BioGuard Plus, our first biological insecticide formulation. This marks a significant milestone in our commitment to sustainable agriculture and environmental stewardship.",
      "BioGuard Plus is based on Beauveria bassiana (1 × 10⁸ CFU/g), a naturally occurring entomopathogenic fungus that targets a wide range of soft-bodied insect pests including whiteflies, aphids, mealybugs, and caterpillars.",
      "Key advantages of BioGuard Plus include zero pre-harvest interval, safety for pollinators and beneficial insects, compatibility with organic farming standards, and no development of pest resistance.",
      "The product has undergone rigorous field trials across multiple states over the past two years, demonstrating 70-85% efficacy against target pests when used as part of an Integrated Pest Management program.",
      "BioGuard Plus is now available through our nationwide distributor network in 100g, 250g, 500g, and 1kg pack sizes. Contact your nearest distributor or reach out to us for more information.",
    ],
    category: "product",
    date: "2026-03-05",
    author: "Marketing Team",
  },
  {
    id: "news-002",
    title: "Shree Balaji Expands Distribution Network to 5 New States",
    slug: "distribution-expansion-2026",
    excerpt: "Our distribution reach now covers over 20 states, bringing quality crop protection solutions closer to every farmer across India.",
    content: [
      "We are excited to announce the expansion of our distribution network into 5 new states – Telangana, Odisha, Jharkhand, Chhattisgarh, and Assam. This expansion brings our total coverage to over 20 states across India.",
      "The expansion adds 75 new distributors and 300+ retail touchpoints to our existing network of 500+ distributors. This strategic growth ensures that farmers in these regions have easier access to our premium crop protection products.",
      "Each new distribution partner has been carefully selected based on their agricultural market expertise, warehousing capabilities, and commitment to customer service. Comprehensive training programs have been conducted to ensure product knowledge and service quality.",
      "With this expansion, Shree Balaji Agro Industries strengthens its position as a pan-India agrochemical brand committed to serving farmers in every corner of the country.",
    ],
    category: "company",
    date: "2026-02-20",
    author: "Corporate Communications",
  },
  {
    id: "news-003",
    title: "Kharif Season 2026: Pest Management Advisory for Major Crops",
    slug: "kharif-2026-advisory",
    excerpt: "Expert recommendations for managing common pests during the upcoming Kharif cropping season, including product recommendations and timing.",
    content: [
      "As the Kharif season approaches, Shree Balaji Agro Industries' technical team has prepared comprehensive pest management advisories for major crops including rice, cotton, soybean, and vegetables.",
      "**Rice** — Begin with seed treatment using systemic insecticides. Monitor for stem borers from 30 days after transplanting. Apply Sumo Fighter at first sign of BPH or leaf folder infestation.",
      "**Cotton** — Early-season jassid and aphid management is critical. Use systemic insecticides at the 2-4 leaf stage. Switch to contact insecticides for bollworm management during square formation. Implement refuge crop strategy for Bt cotton.",
      "**Soybean** — Pre-emergence herbicide application within 3 days of sowing is essential. Monitor for defoliators from the vegetative stage. Apply Jaguar preventively at flowering for fungal and larval management.",
      "For detailed crop-specific advisories, contact your local Shree Balaji representative or visit our Knowledge Base for comprehensive guides.",
    ],
    category: "advisory",
    date: "2026-02-10",
    author: "Technical Advisory Team",
  },
  {
    id: "news-004",
    title: "Award for Best Quality Agrochemicals at AgriExpo 2025",
    slug: "agriexpo-2025-award",
    excerpt: "Shree Balaji Agro Industries recognized for outstanding quality standards in agrochemical manufacturing at the national AgriExpo 2025.",
    content: [
      "Shree Balaji Agro Industries has been honored with the 'Best Quality Agrochemicals' award at the prestigious AgriExpo 2025 held in New Delhi. This recognition acknowledges our unwavering commitment to product quality and manufacturing excellence.",
      "The award was presented by the Hon'ble Minister of Agriculture and evaluated by an independent panel of agrochemical industry experts based on product quality, manufacturing standards, quality control processes, and customer satisfaction.",
      "Our state-of-the-art manufacturing facility in Rajasthan maintains ISO 9001:2015 certification and follows GMP (Good Manufacturing Practices) standards. Every batch undergoes rigorous multi-point quality testing before release.",
      "We dedicate this award to our entire team – from R&D scientists and production engineers to our distribution partners and the farmers who trust our products to protect their livelihoods.",
    ],
    category: "achievement",
    date: "2026-01-28",
    author: "Corporate Communications",
  },
  {
    id: "news-005",
    title: "New Triazole Fungicide TriazolGuard Now Available Nationwide",
    slug: "triazolguard-nationwide",
    excerpt: "Our advanced propiconazole-based fungicide is now available across all distribution territories for superior disease management.",
    content: [
      "Following successful regional launches and extensive field trials, TriazolGuard (Propiconazole 25% EC) is now available through our complete distribution network across India.",
      "TriazolGuard has shown exceptional performance in managing rust diseases in wheat, sheath blight in rice, and tikka leaf spot in groundnut, with consistently 85-95% disease control in field trials.",
      "The product offers a unique growth stimulant effect on crops, resulting in greener foliage and improved photosynthetic efficiency even in the absence of disease pressure.",
      "Distributors can now place orders through the portal. Introductory schemes are available for the first quarter. Contact your territory manager for details.",
    ],
    category: "product",
    date: "2026-01-15",
    author: "Product Management",
  },
  {
    id: "news-006",
    title: "Industry Update: New Regulations on Pesticide Labeling in India",
    slug: "pesticide-labeling-regulations",
    excerpt: "Summary of the latest regulatory changes affecting pesticide labeling requirements and what it means for distributors and farmers.",
    content: [
      "The Central Insecticide Board & Registration Committee (CIB&RC) has announced updated labeling requirements for all pesticide products effective from April 2026.",
      "Key changes include mandatory QR codes linking to digital product information, enhanced pictogram-based safety instructions for low-literacy users, bilingual labels in English and the predominant regional language, and clearer first-aid instructions.",
      "Shree Balaji Agro Industries has already begun implementing these changes across our product range. All products manufactured after March 2026 will carry the new-format labels.",
      "Distributors are advised to familiarize themselves with the new label format and help farmers understand the additional information now available. Training materials will be shared through the distributor portal.",
    ],
    category: "industry",
    date: "2026-01-05",
    author: "Regulatory Affairs",
  },
];

export const getNewsById = (id: string) => newsArticles.find((a) => a.id === id);
export const getNewsBySlug = (slug: string) => newsArticles.find((a) => a.slug === slug);

// Team
export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
}

export const teamMembers: TeamMember[] = [
  { name: "Manoj Shankar Chaudhari", role: "Managing Director", bio: "Managing Director of Shree Balaji Agro Industries, leading the company's vision to empower Indian farmers with high-quality, effective crop protection and nutrition solutions.", initials: "MC" },
];

// FAQ
export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  { question: "How can I become a distributor for Shree Balaji Agro Industries?", answer: "Submit a distribution partnership inquiry through our Contact page or call our sales team directly. We evaluate distributors based on territory coverage, warehousing capability, and market experience. Our team will guide you through the onboarding process." },
  { question: "What is the minimum order quantity for distributors?", answer: "Minimum order quantities vary by product. Generally, a minimum order value of ₹25,000 applies. New distributors may have adjusted minimums during the initial trial period. Contact your territory manager for specific details." },
  { question: "Do you provide technical training for distributors and dealers?", answer: "Yes! We conduct regular training programs covering product knowledge, application techniques, safety protocols, and market development. Training is available through in-person workshops, webinars, and self-paced modules on our distributor portal." },
  { question: "How do I track my order status?", answer: "Registered distributors can track orders in real-time through the Distributor Portal. Navigate to the Orders section and click on any order to view its current status, expected delivery date, and complete shipment history." },
  { question: "Are your products approved for organic farming?", answer: "Our bio-products line, including BioGuard Plus, is approved for use in organic farming. These products are based on naturally occurring organisms and carry relevant organic certifications. Check individual product labels for specific organic farming approvals." },
  { question: "What is your return and replacement policy?", answer: "We accept returns for manufacturing defects or quality issues within 30 days of delivery. Products must be in original sealed packaging. Contact our support team with your order number and the issue description to initiate a return or replacement." },
  { question: "How can I get product safety data sheets (MSDS)?", answer: "Material Safety Data Sheets are available for all our products. Registered users can download them from the product pages on our website. Alternatively, contact our technical support team and we'll email the required documents." },
];

// Company milestones
export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export const milestones: Milestone[] = [
  { year: "2010", title: "Company Founded", description: "Shree Balaji Agro Industries established in Maharashtra with a vision to provide quality crop protection solutions." },
  { year: "2014", title: "First Product Line & ISO Certification", description: "Launched initial range of insecticides and fungicides. Achieved ISO 9001 certification for manufacturing excellence." },
  { year: "2022", title: "50+ Distributors", description: "Crossed the 50+ distributor milestone, strengthening our partner network across Maharashtra and beyond." },
  { year: "2026", title: "Bio-Stimulant License", description: "Received official bio-stimulant license, expanding our portfolio into sustainable plant growth solutions." },
];
