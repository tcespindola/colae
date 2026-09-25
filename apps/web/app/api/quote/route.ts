import { NextResponse } from "next/server";
import { calculateQuote, type PricingCatalog } from "@colae/pricing";
import { getCatalog } from "@colae/db/catalog";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const catalog = await getCatalog();
    const hasCatalog = catalog.products.length > 0;
    const pricingCatalog: PricingCatalog | undefined = hasCatalog ? {
      products: catalog.products.map(i => ({ id:i.id, name:i.name, setup:i.value })),
      materials: catalog.materials.map(i => ({ id:i.id, name:i.name, pricePerM2:i.value })),
      finishes: catalog.finishes.map(i => ({ id:i.id, name:i.name, pricePerM2:i.value })),
      dies: catalog.dies.map(i => ({ id:i.id, name:i.name, price:i.value })),
      quantityTiers: catalog.quantityTiers.filter(i=>i.active).map(i => ({ min:i.minQuantity, factor:i.factor }))
    } : undefined;

    const quote = calculateQuote({
      productId: String(body.productId ?? body.product ?? ""),
      materialId: String(body.materialId ?? body.material ?? ""),
      widthMm: Number(body.widthMm ?? body.width),
      heightMm: Number(body.heightMm ?? body.height),
      quantity: Number(body.quantity),
      finishIds: Array.isArray(body.finishIds) ? body.finishIds.map(String) : [String(body.finishId ?? body.finish ?? "none")],
      dieId: body.dieId ? String(body.dieId) : "standard"
    }, pricingCatalog);

    return NextResponse.json({ ...quote, source: hasCatalog ? "database" : "fallback" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dados inválidos." }, { status: 400 });
  }
}