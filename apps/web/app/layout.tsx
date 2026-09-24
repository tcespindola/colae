import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "COLAE — Orçamento de etiquetas", description: "Configure suas etiquetas e receba um orçamento instantâneo." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
