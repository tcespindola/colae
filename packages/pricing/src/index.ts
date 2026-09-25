import { dies, finishes, materials, products, quantityTiers } from "./catalog";

export type QuoteInput = {
  productId: string; materialId: string; widthMm: number; heightMm: number; quantity: number; finishIds: string[]; dieId?: string | null;
};
export type PricingCatalog = {
  products: typeof products; materials: typeof materials; finishes: typeof finishes; dies: typeof dies;
  quantityTiers: Array<{ min: number; factor: number }>; margin?: number;
};
export type Quote = { currency:"BRL"; breakdown:{material:number;finishing:number;die:number;production:number;setup:number;margin:number;subtotal:number;total:number;unitPrice:number}; assumptions:string[] };

const DEFAULT_MARGIN=.35, BLEED_MM=2;
const round=(value:number)=>Number(value.toFixed(2));

export function calculateQuote(input:QuoteInput, catalog:PricingCatalog = {products,materials,finishes,dies,quantityTiers}):Quote {
  if(!Number.isFinite(input.widthMm)||!Number.isFinite(input.heightMm)||input.widthMm<=0||input.heightMm<=0) throw new Error("Dimensões inválidas.");
  if(!Number.isInteger(input.quantity)||input.quantity<100||input.quantity>1000000) throw new Error("Quantidade deve estar entre 100 e 1.000.000.");
  const product=catalog.products.find(i=>i.id===input.productId);
  const material=catalog.materials.find(i=>i.id===input.materialId);
  const selectedFinishes=input.finishIds.map(id=>catalog.finishes.find(i=>i.id===id));
  const die=catalog.dies.find(i=>i.id===(input.dieId??"standard"));
  if(!product) throw new Error("Produto inválido.");
  if(!material) throw new Error("Material inválido.");
  if(selectedFinishes.some(i=>!i)) throw new Error("Acabamento inválido.");
  if(!die) throw new Error("Faca inválida.");

  const widthM=(input.widthMm+BLEED_MM*2)/1000, heightM=(input.heightMm+BLEED_MM*2)/1000, areaM2=widthM*heightM;
  const materialCost=input.quantity*areaM2*material.pricePerM2;
  const finishingCost=input.quantity*areaM2*selectedFinishes.reduce((sum,item)=>sum+(item?.pricePerM2??0),0);
  const productionCost=input.quantity*Math.max(.025,areaM2*35);
  const tier=catalog.quantityTiers.find(item=>input.quantity>=item.min)??catalog.quantityTiers[catalog.quantityTiers.length-1];
  if(!tier) throw new Error("Nenhuma regra de quantidade configurada.");
  const production=(materialCost+finishingCost+productionCost)*tier.factor;
  const setup=product.setup, dieCost=die.price, subtotal=production+setup+dieCost;
  const margin=subtotal*(catalog.margin??DEFAULT_MARGIN), total=round(subtotal+margin);

  return {currency:"BRL",breakdown:{material:round(materialCost*tier.factor),finishing:round(finishingCost*tier.factor),die:round(dieCost),production:round(productionCost*tier.factor),setup:round(setup),margin:round(margin),subtotal:round(subtotal),total,unitPrice:round(total/input.quantity)},assumptions:["Catálogo carregado pelo servidor.","Sangria considerada: 2 mm por lado.",`Margem aplicada: ${((catalog.margin??DEFAULT_MARGIN)*100).toFixed(0)}%.`]};
}

export { products, materials, finishes, dies, quantityTiers };