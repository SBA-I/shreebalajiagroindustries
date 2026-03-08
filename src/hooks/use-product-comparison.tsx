import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/data/products";

interface ComparisonContextType {
  items: Product[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
  isInComparison: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | null>(null);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);

  const add = (product: Product) => {
    setItems((prev) => (prev.length >= 4 || prev.find((p) => p.id === product.id) ? prev : [...prev, product]));
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);
  const isInComparison = (id: string) => items.some((p) => p.id === id);

  return (
    <ComparisonContext.Provider value={{ items, add, remove, clear, isInComparison }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error("useComparison must be used within ComparisonProvider");
  return ctx;
};
