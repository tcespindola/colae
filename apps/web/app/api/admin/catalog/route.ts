import { NextRequest, NextResponse } from "next/server";
import { getCatalog, updateCatalog, type CatalogSnapshot } from "@colae/db/catalog";

const COOKIE = "colae_admin";
const token = () => process.env.COLAE_ADMIN_KEY ? Buffer.from(process.env.COLAE_ADMIN_KEY).toString("base64url") : "";

function authorized(request: NextRequest) {
  const key = process.env.COLAE_ADMIN_KEY;
  if (!key) return false;
  return request.cookies.get(COOKIE)?.value === token();
}

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({
    configured: false,
    message: "DATABASE_URL ainda não foi configurada.",
    catalog: { products: [], materials: [], finishes: [], dies: [], quantityTiers: [] }
  });
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try { return NextResponse.json({ configured: true, catalog: await getCatalog() }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar o catálogo." }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const body = await request.json() as CatalogSnapshot;
    await updateCatalog(body);
    return NextResponse.json({ ok: true, catalog: await getCatalog() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível salvar o catálogo." }, { status: 400 });
  }
}
