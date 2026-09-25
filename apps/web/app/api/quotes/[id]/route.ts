import { NextRequest, NextResponse } from "next/server";
import { getQuote, getQuoteForPublic, updateQuoteStatus, type QuoteStatus } from "@colae/db";
import { isAdmin } from "../../../lib/admin-auth";

function publicQuote(quote: Awaited<ReturnType<typeof getQuote>>) {
  if (!quote) return null;
  return { id: quote.id, status: quote.status, input: quote.input, quote: quote.quote, createdAt: quote.createdAt, updatedAt: quote.updatedAt };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token");
  if (token) {
    const quote = await getQuoteForPublic(id, token);
    if (!quote) return NextResponse.json({ error: "Orçamento não encontrado ou link inválido." }, { status: 404 });
    return NextResponse.json(publicQuote(quote));
  }
  if (!isAdmin(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const quote = await getQuote(id);
  if (!quote) return NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const allowed: QuoteStatus[] = ["draft", "sent", "approved", "rejected", "expired"];
  if (!allowed.includes(body.status)) return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  const ok = await updateQuoteStatus(id, body.status as QuoteStatus);
  return ok ? NextResponse.json({ ok: true, status: body.status }) : NextResponse.json({ error: "Orçamento não encontrado." }, { status: 404 });
}
