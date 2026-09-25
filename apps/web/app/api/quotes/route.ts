import { NextResponse } from "next/server";
import { saveQuote, databaseConfigured } from "@colae/db";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.input || !body?.quote) return NextResponse.json({ error: "Orçamento inválido." }, { status: 400 });
    const id = randomUUID();
    const persisted = await saveQuote(id, body.input, body.quote);
    return NextResponse.json({ id, persisted, storage: databaseConfigured() ? "postgres" : "memory-fallback" });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar o orçamento." }, { status: 500 });
  }
}
