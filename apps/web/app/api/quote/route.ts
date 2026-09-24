import { NextResponse } from "next/server";
import { calculateQuote } from "@colae/pricing";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quote = calculateQuote({
      productId: String(body.productId ?? body.product ?? ""),
      materialId: String(body.materialId ?? body.material ?? ""),
      widthMm: Number(body.widthMm ?? body.width),
      heightMm: Number(body.heightMm ?? body.height),
      quantity: Number(body.quantity),
      finishIds: Array.isArray(body.finishIds) ? body.finishIds.map(String) : [String(body.finishId ?? body.finish ?? "none")],
      dieId: body.dieId ? String(body.dieId) : "standard"
    });

    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Dados inválidos." },
      { status: 400 }
    );
  }
}
