export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  total: number;
  deliveryDate?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: string;
}

export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  type: "support" | "announcement" | "order" | "general";
}

export const statusColors: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export const mockOrders: Order[] = [
  {
    id: "ord-001", orderNumber: "ORD-2026-001", date: "2026-03-05",
    status: "delivered",
    items: [
      { productId: "sb-ins-001", productName: "CropShield Super", quantity: 200, unit: "L", price: 850 },
      { productId: "sb-fun-001", productName: "FungiCure Max", quantity: 100, unit: "kg", price: 620 },
    ],
    total: 232000, deliveryDate: "2026-03-08",
  },
  {
    id: "ord-002", orderNumber: "ORD-2026-002", date: "2026-03-01",
    status: "shipped",
    items: [
      { productId: "sb-her-001", productName: "WeedClear 41", quantity: 500, unit: "L", price: 480 },
    ],
    total: 240000, deliveryDate: "2026-03-10",
  },
  {
    id: "ord-003", orderNumber: "ORD-2026-003", date: "2026-02-25",
    status: "processing",
    items: [
      { productId: "sb-pgr-001", productName: "GrowMax Elite", quantity: 150, unit: "L", price: 720 },
      { productId: "sb-ins-003", productName: "BioGuard Plus", quantity: 80, unit: "kg", price: 1100 },
    ],
    total: 196000,
  },
  {
    id: "ord-004", orderNumber: "ORD-2026-004", date: "2026-02-20",
    status: "confirmed",
    items: [
      { productId: "sb-fun-003", productName: "TriazolGuard", quantity: 300, unit: "L", price: 950 },
    ],
    total: 285000,
  },
  {
    id: "ord-005", orderNumber: "ORD-2026-005", date: "2026-02-15",
    status: "pending",
    items: [
      { productId: "sb-her-002", productName: "SelectiWeed Pro", quantity: 250, unit: "L", price: 390 },
      { productId: "sb-pgr-002", productName: "RootBoost 500", quantity: 100, unit: "L", price: 560 },
    ],
    total: 153500,
  },
  {
    id: "ord-006", orderNumber: "ORD-2026-006", date: "2026-02-10",
    status: "delivered",
    items: [
      { productId: "sb-ins-002", productName: "TermiKill Pro", quantity: 400, unit: "L", price: 520 },
    ],
    total: 208000, deliveryDate: "2026-02-14",
  },
  {
    id: "ord-007", orderNumber: "ORD-2026-007", date: "2026-01-28",
    status: "cancelled",
    items: [
      { productId: "sb-fun-002", productName: "CopperShield 50", quantity: 50, unit: "kg", price: 380 },
    ],
    total: 19000, notes: "Cancelled by distributor – duplicate order",
  },
];

export const mockInventory: InventoryItem[] = [
  { productId: "sb-ins-001", productName: "CropShield Super", category: "Insecticides", currentStock: 450, minStock: 100, maxStock: 1000, unit: "L", lastUpdated: "2026-03-07" },
  { productId: "sb-ins-002", productName: "TermiKill Pro", category: "Insecticides", currentStock: 80, minStock: 100, maxStock: 800, unit: "L", lastUpdated: "2026-03-06" },
  { productId: "sb-ins-003", productName: "BioGuard Plus", category: "Insecticides", currentStock: 220, minStock: 50, maxStock: 500, unit: "kg", lastUpdated: "2026-03-07" },
  { productId: "sb-fun-001", productName: "FungiCure Max", category: "Fungicides", currentStock: 310, minStock: 80, maxStock: 600, unit: "kg", lastUpdated: "2026-03-05" },
  { productId: "sb-fun-002", productName: "CopperShield 50", category: "Fungicides", currentStock: 45, minStock: 60, maxStock: 400, unit: "kg", lastUpdated: "2026-03-04" },
  { productId: "sb-fun-003", productName: "TriazolGuard", category: "Fungicides", currentStock: 180, minStock: 50, maxStock: 500, unit: "L", lastUpdated: "2026-03-07" },
  { productId: "sb-her-001", productName: "WeedClear 41", category: "Herbicides", currentStock: 600, minStock: 150, maxStock: 1200, unit: "L", lastUpdated: "2026-03-06" },
  { productId: "sb-her-002", productName: "SelectiWeed Pro", category: "Herbicides", currentStock: 25, minStock: 80, maxStock: 500, unit: "L", lastUpdated: "2026-03-03" },
  { productId: "sb-her-003", productName: "PreEmerge Shield", category: "Herbicides", currentStock: 340, minStock: 100, maxStock: 700, unit: "L", lastUpdated: "2026-03-07" },
  { productId: "sb-pgr-001", productName: "GrowMax Elite", category: "PGR", currentStock: 150, minStock: 40, maxStock: 400, unit: "L", lastUpdated: "2026-03-06" },
  { productId: "sb-pgr-002", productName: "RootBoost 500", category: "PGR", currentStock: 90, minStock: 30, maxStock: 300, unit: "L", lastUpdated: "2026-03-05" },
  { productId: "sb-pgr-003", productName: "YieldPlus Pro", category: "PGR", currentStock: 200, minStock: 50, maxStock: 500, unit: "L", lastUpdated: "2026-03-07" },
];

export const mockMessages: Message[] = [
  { id: "msg-1", from: "Admin Team", subject: "New Product Launch: BioGuard Plus", preview: "We are excited to announce the launch of BioGuard Plus, our new bio-insecticide...", date: "2026-03-07", read: false, type: "announcement" },
  { id: "msg-2", from: "Order Support", subject: "Order ORD-2026-002 Shipped", preview: "Your order has been shipped and is expected to arrive by March 10...", date: "2026-03-06", read: false, type: "order" },
  { id: "msg-3", from: "Technical Support", subject: "RE: Application rate for TriazolGuard", preview: "Thank you for your query. The recommended application rate for TriazolGuard is...", date: "2026-03-05", read: true, type: "support" },
  { id: "msg-4", from: "Admin Team", subject: "Kharif Season Scheme – Extra Discounts", preview: "Special seasonal discounts available for bulk orders placed before April 15...", date: "2026-03-02", read: true, type: "announcement" },
  { id: "msg-5", from: "Logistics", subject: "Delivery schedule update for March", preview: "Please note the updated delivery schedule for your territory during March...", date: "2026-02-28", read: true, type: "general" },
];
