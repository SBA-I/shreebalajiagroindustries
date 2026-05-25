import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";

const Index = () => {
  return (
    <Layout>
      <SEO
        title="Shree Balaji Agro Industries — Crop Protection for Indian Farmers"
        description="Premium insecticides, fungicides, herbicides, and PGR products from Shree Balaji Agro Industries. Trusted by distributors and farmers across India."
        path="/"
        jsonLd={{
          "@type": "WebSite",
          name: "Shree Balaji Agro Industries",
          url: "https://shreebalajiagroindustries.lovable.app",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://shreebalajiagroindustries.lovable.app/products?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <HeroSection />
      <FeaturedProducts />
      <StatsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </Layout>
  );
};

export default Index;
