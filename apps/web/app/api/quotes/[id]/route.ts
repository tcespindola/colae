import { NextResponse } from "next/server";
import { getQuote, databaseConfigured } from "@colae/db";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!databaseConfigured()) return NextResponse.json({ error: "Banco de dados ainda não configurado." }, { status: 503 });
  const quote = await getQuote(id);
  if (!quote) return NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });
  return NextResponse.json(quote);
}
