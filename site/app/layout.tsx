import type { Metadata, Viewport } from "next";
import { BrandSprite } from "@/app/components/brand";
import "./globals.css";

const description = "Imóveis selecionados em Curitiba e região, com atendimento próximo e negociação transparente.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gabriel-coraiola-imoveis.gabriel-coraiola.workers.dev"),
  title: "Gabriel Coraiola Imóveis · Curitiba e região",
  description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Gabriel Coraiola Imóveis",
    title: "Gabriel Coraiola Imóveis",
    description,
    images: [{ url: "/images/casa-condominio.png" }],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1f1b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <BrandSprite />
        {children}
      </body>
    </html>
  );
}
