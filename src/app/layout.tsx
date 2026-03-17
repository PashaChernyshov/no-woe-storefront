import type { Metadata } from "next";
import "./globals.css";
import { ShopProvider } from "@/providers/ShopProvider";

export const metadata: Metadata = {
  title: {
    default: "NO WOE",
    template: "%s | NO WOE",
  },
  description: "Minimal streetwear storefront with a catalog-first clothing shop experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <ShopProvider>{children}</ShopProvider>
      </body>
    </html>
  );
}
