import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getQuoteForPublic } from "@colae/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token obrigatório." }, { status: 401 });

  const quote = await getQuoteForPublic(id, token);
  if (!quote) return NextResponse.json({ error: "Orçamento não encontrado ou link inválido." }, { status: 404 });

  try {
    const input = quote.input as Record<string, unknown>;
    const pricing = quote.quote as any;
    const b = pricing.breakdown ?? {};
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const navy = rgb(0.06, 0.11, 0.23);
    const mint = rgb(0.16, 0.76, 0.69);
    const gray = rgb(0.45, 0.47, 0.52);

    page.drawText("COLAE.", { x: 48, y: 778, size: 27, font: bold, color: navy });
    page.drawText("PROPOSTA COMERCIAL", { x: 48, y: 742, size: 10, font: bold, color: mint });
    page.drawText("Orçamento #" + quote.id.slice(0, 8).toUpperCase(), { x: 390, y: 778, size: 9, font, color: gray });
    page.drawText(new Date(quote.createdAt).toLocaleDateString("pt-BR"), { x: 390, y: 762, size: 9, font, color: gray });

    page.drawText("ESPECIFICAÇÕES", { x: 48, y: 690, size: 10, font: bold, color: gray });
    const rows = [
      ["Produto", String(input.productId ?? "—")],
      ["Material", String(input.materialId ?? "—")],
      ["Dimensão", String(input.widthMm ?? "—") + " × " + String(input.heightMm ?? "—") + " mm"],
      ["Quantidade", Number(input.quantity ?? 0).toLocaleString("pt-BR")],
      ["Acabamento", Array.isArray(input.finishIds) ? input.finishIds.join(", ") : "—"],
      ["Faca", String(input.dieId ?? "standard")]
    ];
    rows.forEach((row, i) => {
      const y = 660 - i * 30;
      page.drawText(row[0], { x: 48, y, size: 9, font: bold, color: gray });
      page.drawText(row[1], { x: 170, y, size: 10, font, color: navy });
    });

    page.drawText("COMPOSIÇÃO DO VALOR", { x: 48, y: 465, size: 10, font: bold, color: gray });
    const costs = [
      ["Material", b.material], ["Acabamento", b.finishing], ["Produção", b.production],
      ["Setup", b.setup], ["Faca", b.die], ["Margem", b.margin]
    ];
    costs.forEach((row, i) => {
      const y = 435 - i * 25;
      page.drawText(row[0], { x: 48, y, size: 9, font, color: gray });
      page.drawText("R$ " + Number(row[1] ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 }), { x: 390, y, size: 9, font, color: navy });
    });

    page.drawText("TOTAL", { x: 48, y: 250, size: 11, font: bold, color: mint });
    page.drawText("R$ " + Number(b.total ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 }), { x: 48, y: 208, size: 29, font: bold, color: navy });
    page.drawText("R$ " + Number(b.unitPrice ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + " / unidade", { x: 48, y: 185, size: 9, font, color: gray });

    page.drawText("Condições", { x: 48, y: 125, size: 9, font: bold, color: gray });
    page.drawText("Valores sujeitos à confirmação comercial. A proposta é baseada no catálogo", { x: 48, y: 108, size: 8, font, color: gray });
    page.drawText("vigente no momento do cálculo. O prazo de produção será confirmado após aprovação.", { x: 48, y: 94, size: 8, font, color: gray });
    page.drawText("Link seguro de aprovação: /orcamento/" + quote.id, { x: 48, y: 62, size: 7, font, color: gray });

    const bytes = await pdf.save();
    return new NextResponse(bytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="colae-proposta-' + quote.id.slice(0, 8) + '.pdf"',
        "Cache-Control": "private, no-store"
      }
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível gerar o PDF." }, { status: 500 });
  }
}
