export type Product = {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  subheadline: string | null;
  description: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  image_path: string | null;
  pdf_path: string | null;
  active: boolean;
  // Só um produto no catálogo pode ser o principal (vendido no link de
  // checkout). Os demais se auto-classificam com um papel em relação a ele.
  is_main_product: boolean;
  offer_role: "upsell" | "downsell" | null;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  product_slug: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbp: string | null;
  fbc: string | null;
  created_at: string;
};

export type OrderItem = {
  slug: string;
  name: string;
  price_cents: number;
};

export type OrderStatus = "pending" | "mock_paid" | "paid" | "failed";

export type Order = {
  id: string;
  lead_id: string | null;
  product_slug: string;
  email: string;
  full_name: string | null;
  items: OrderItem[];
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: string;
  status: OrderStatus;
  stripe_payment_intent_id: string | null;
  created_at: string;
};
