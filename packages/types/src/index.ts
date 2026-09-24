export type QuoteRequest = {
  productId: string;
  materialId: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  finishIds: string[];
  dieId?: string | null;
};

export type QuoteBreakdown = {
  material: number;
  finishing: number;
  die: number;
  production: number;
  setup: number;
  margin: number;
  subtotal: number;
  total: number;
  unitPrice: number;
};

export type QuoteResponse = {
  currency: "BRL";
  breakdown: QuoteBreakdown;
  assumptions: string[];
};
