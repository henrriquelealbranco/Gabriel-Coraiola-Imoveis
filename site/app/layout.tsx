import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gabriel Coraiola Imóveis",
  description: "Imóveis selecionados em Curitiba e região, com atendimento próximo e negociação transparente.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
