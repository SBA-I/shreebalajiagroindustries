import { Helmet } from "react-helmet-async";

const SITE_URL = "https://shreebalajiagroindustries.lovable.app";
const DEFAULT_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c24d8332-3c3b-4736-bd16-f5c4735013a0/id-preview-c7e65002--aeb15e14-8124-4f7a-b327-f1e637975c3c.lovable.app-1777700853189.png";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

/**
 * Per-route SEO helper. Sets title/description/canonical/og + optional JSON-LD.
 * Title is automatically suffixed with the brand unless it already contains it.
 */
export default function SEO({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  jsonLd,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title.includes("Shree Balaji")
    ? title
    : `${title} | Shree Balaji Agro Industries`;
  const url = `${SITE_URL}${path}`;
  const ldArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify({ "@context": "https://schema.org", ...ld })}
        </script>
      ))}
    </Helmet>
  );
}