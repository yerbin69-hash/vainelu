import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Vainelú · Tu tarta. A tu manera.",
  description:
    "Catálogo de tartas Vainelú. Demostración sin pedidos ni cobros reales.",
  referrer: "no-referrer",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
