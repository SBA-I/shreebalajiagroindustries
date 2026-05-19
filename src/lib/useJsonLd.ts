import { useEffect } from "react";

// Injects a JSON-LD <script> into <head> for the lifetime of the component.
// No external deps — avoids pulling in react-helmet-async.
export const useJsonLd = (id: string, data: Record<string, unknown> | null) => {
  useEffect(() => {
    if (!data) return;
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.text = JSON.stringify({ "@context": "https://schema.org", ...data });
    document.head.appendChild(script);
    return () => { document.getElementById(id)?.remove(); };
  }, [id, JSON.stringify(data)]);
};