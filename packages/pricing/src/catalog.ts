export type Material = {
  id: string;
  name: string;
  pricePerM2: number;
};

export type Finish = {
  id: string;
  name: string;
  pricePerM2: number;
};

export type Product = {
  id: string;
  name: string;
  setup: number;
};

export type Die = {
  id: string;
  name: string;
  price: number;
};

export const products: Product[] = [
  { id: "label", name: "Etiqueta adesiva", setup: 25 },
  { id: "sticker", name: "Sticker personalizado", setup: 35 }
];

export const materials: Material[] = [
  { id: "bopp-white", name: "BOPP branco", pricePerM2: 180 },
  { id: "paper-white", name: "Papel branco", pricePerM2: 120 },
  { id: "paper-kraft", name: "Papel kraft", pricePerM2: 140 }
];

export const finishes: Finish[] = [
  { id: "none", name: "Sem acabamento", pricePerM2: 0 },
  { id: "matte", name: "Laminação fosca", pricePerM2: 60 },
  { id: "gloss", name: "Laminação brilho", pricePerM2: 70 }
];

export const dies: Die[] = [
  { id: "standard", name: "Faca padrão", price: 0 },
  { id: "custom", name: "Faca especial", price: 45 }
];

export const quantityTiers = [
  { min: 5000, factor: 0.88 },
  { min: 2500, factor: 0.93 },
  { min: 1000, factor: 0.97 },
  { min: 1, factor: 1 }
];
