import { NextResponse } from "next/server";
import { getCatalog } from "@colae/db/catalog";

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({
    configured: false,
    message: "DATABASE_URL ainda não foi configurada.",
    catalog: { products: [], materials: [], finishes: [], dies: [], quantityTiers: [] }
  });
  try { return NextResponse.json({ configured: true, catalog: await getCatalog() }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar o catálogo." }, { status: 500 }); }
}