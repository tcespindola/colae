import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { calculateQuote } from "@colae/pricing";

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const quote = calculateQuote({
      productId: url.searchParams.get("productId") ?? "label",
      materialId: url.searchParams.get("materialId") ?? "bopp-white",
      widthMm: Number(url.searchParams.get("widthMm")),
      heightMm: Number(url.searchParams.get("heightMm")),
      quantity: Number(url.searchParams.get("quantity")),
      finishIds: [url.searchParams.get("finishId") ?? "none"],
      dieId: url.searchParams.get("dieId") ?? "standard"
    });

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    page.drawText("COLAE.", { x: 48, y: 780, size: 26, font: bold, color: rgb(0.06,0.11,0.23) });
    page.drawText("ORÇAMENTO ESTIMADO", { x: 48, y: 738, size: 11, font: bold, color: rgb(0.16,0.76,0.69) });
    page.drawText(`Dimensão: ${url.searchParams.get("widthMm")} × ${url.searchParams.get("heightMm")} mm`, { x:48, y:680, size:12, font });
    page.drawText(`Quantidade: ${url.searchParams.get("quantity")}`, { x:48, y:655, size:12, font });
    page.drawText(`Material: ${url.searchParams.get("materialId")}`, { x:48, y:630, size:12, font });
    page.drawText(`Acabamento: ${url.searchParams.get("finishId")}`, { x:48, y:605, size:12, font });
    page.drawText(`Faca: ${url.searchParams.get("dieId")}`, { x:48, y:580, size:12, font });
    page.drawText(`Total estimado: R$ ${quote.breakdown.total.toFixed(2).replace(".",",")}`, { x:48, y:505, size:24, font:bold, color:rgb(0.06,0.11,0.23) });
    page.drawText("Valores sujeitos à confirmação comercial e à tabela vigente da COLAE.", { x:48, y:70, size:9, font, color:rgb(0.45,0.47,0.52) });

    const bytes = await pdf.save();
    return new NextResponse(bytes as unknown as BodyInit, { headers: { "Content-Type":"application/pdf", "Content-Disposition":"inline; filename=\"colae-orcamento.pdf\"" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível gerar o PDF." }, { status: 400 });
  }
}
