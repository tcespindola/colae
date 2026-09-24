import { dies, finishes, materials, products, quantityTiers } from "./catalog";

export type QuoteInput = {
  productId: string;
  materialId: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  finishIds: string[];
  dieId?: string | null;
};

export type Quote = {
  currency: "BRL";
  breakdown: {
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
  assumptions: string[];
};

const DEFAULT_MARGIN = 0.35;
const BLEED_MM = 2;

function round(value: number) {
  return Number(value.toFixed(2));
}

export function calculateQuote(input: QuoteInput): Quote {
  if (!Number.isFinite(input.widthMm) || !Number.isFinite(input.heightMm) || input.widthMm <= 0 || input.heightMm <= 0) {
    throw new Error("Dimensões inválidas.");
  }
  if (!Number.isInteger(input.quantity) || input.quantity < 100 || input.quantity > 1000000) {
    throw new Error("Quantidade deve estar entre 100 e 1.000.000.");
  }

  const product = products.find((item) => item.id === input.productId);
  const material = materials.find((item) => item.id === input.materialId);
  const selectedFinishes = input.finishIds.map((id) => finishes.find((item) => item.id === id));
  const die = dies.find((item) => item.id === (input.dieId ?? "standard"));

  if (!product) throw new Error("Produto inválido.");
  if (!material) throw new Error("Material inválido.");
  if (selectedFinishes.some((item) => !item)) throw new Error("Acabamento inválido.");
  if (!die) throw new Error("Faca inválida.");

  // Área com sangria: 2 mm adicionais em cada lado.
  const widthM = (input.widthMm + BLEED_MM * 2) / 1000;
  const heightM = (input.heightMm + BLEED_MM * 2) / 1000;
  const areaM2 = widthM * heightM;

  const materialCost = input.quantity * areaM2 * material.pricePerM2;
  const finishingCost = input.quantity * areaM2 * selectedFinishes.reduce((sum, item) => sum + (item?.pricePerM2 ?? 0), 0);

  // Custo operacional simplificado do MVP. A tabela real da COLAE deve substituir este fator.
  const productionCost = input.quantity * Math.max(0.025, areaM2 * 35);
  const tier = quantityTiers.find((item) => input.quantity >= item.min) ?? quantityTiers.at(-1)!;
  const production = (materialCost + finishingCost + productionCost) * tier.factor;

  const setup = product.setup;
  const dieCost = die.price;
  const subtotal = production + setup + dieCost;
  const margin = subtotal * DEFAULT_MARGIN;
  const total = round(subtotal + margin);

  return {
    currency: "BRL",
    breakdown: {
      material: round(materialCost * tier.factor),
      finishing: round(finishingCost * tier.factor),
      die: round(dieCost),
      production: round(productionCost * tier.factor),
      setup: round(setup),
      margin: round(margin),
      subtotal: round(subtotal),
      total,
      unitPrice: round(total / input.quantity)
    },
    assumptions: [
      "Valores de catálogo são parâmetros de demonstração do MVP e devem ser substituídos pelos custos reais da COLAE.",
      "Sangria considerada: 2 mm por lado.",
      "Margem padrão do MVP: 35%."
    ]
  };
}

export { products, materials, finishes, dies, quantityTiers };
