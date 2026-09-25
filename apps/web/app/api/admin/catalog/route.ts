import { NextRequest, NextResponse } from "next/server";
import { getCatalog, updateCatalog, type CatalogSnapshot } from "@colae/db/catalog";
import { isAdmin } from "../../../../lib/admin-auth";

export async function GET(r: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({
    configured: false,
    message: "DATABASE_URL ainda não foi configurada.",
    catalog: { products: [], materials: [], finishes: [], dies: [], quantityTiers: [] }
  });
  if (!isAdmin(r)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try { return NextResponse.json({ configured: true, catalog: await getCatalog() }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar o catálogo." }, { status: 500 }); }
}

export async function PUT(r: NextRequest) {
  if (!isAdmin(r)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const body = await r.json() as CatalogSnapshot;
    await updateCatalog(body);
    return NextResponse.json({ ok: true, catalog: await getCatalog() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Não foi possível salvar o catálogo." }, { status: 400 });
  }
}
