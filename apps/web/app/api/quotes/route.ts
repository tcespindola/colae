import { NextRequest, NextResponse } from "next/server";
import { saveQuote, listQuotes, databaseConfigured } from "@colae/db";
import { getCatalog } from "@colae/db/catalog";
import { calculateQuote, type PricingCatalog } from "@colae/pricing";
import { randomUUID } from "node:crypto";
import { isAdmin } from "../../../lib/admin-auth";

async function calculateServerQuote(input: Record<string, unknown>) {
  const catalog = await getCatalog();
  const hasCatalog = catalog.products.length > 0;
  const pricingCatalog: PricingCatalog | undefined = hasCatalog ? {
    products: catalog.products.map(i => ({ id: i.id, name: i.name, setup: i.value })),
    materials: catalog.materials.map(i => ({ id: i.id, name: i.name, pricePerM2: i.value })),
    finishes: catalog.finishes.map(i => ({ id: i.id, name: i.name, pricePerM2: i.value })),
    dies: catalog.dies.map(i => ({ id: i.id, name: i.name, price: i.value })),
    quantityTiers: catalog.quantityTiers.filter(i => i.active).map(i => ({ min: i.minQuantity, factor: i.factor }))
  } : undefined;

  return calculateQuote({
    productId: String(input.productId ?? input.product ?? ""),
    materialId: String(input.materialId ?? input.material ?? ""),
    widthMm: Number(input.widthMm ?? input.width),
    heightMm: Number(input.heightMm ?? input.height),
    quantity: Number(input.quantity),
    finishIds: Array.isArray(input.finishIds) ? input.finishIds.map(String) : [String(input.finishId ?? input.finish ?? "none")],
    dieId: input.dieId ? String(input.dieId) : "standard"
  }, pricingCatalog);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.input) return NextResponse.json({ error: "Orçamento inválido." }, { status: 400 });

    // Never trust a client-calculated price: the server recalculates from the authoritative catalog.
    const quote = await calculateServerQuote(body.input);
    const id = randomUUID();
    const result = await saveQuote(id, body.input, quote, body.customer);

    return NextResponse.json({
      id,
      persisted: result.persisted,
      publicToken: result.publicToken,
      quote,
      storage: databaseConfigured() ? "postgres" : "memory-fallback"
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível salvar o orçamento." }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (!databaseConfigured()) return NextResponse.json({ quotes: [], configured: false });
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 50);
  try {
    return NextResponse.json({ quotes: await listQuotes(limit), configured: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar os orçamentos." }, { status: 500 });
  }
}
