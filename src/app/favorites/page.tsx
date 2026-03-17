import type { Metadata } from "next";
import FavoritesPageClient from "@/components/FavoritesPageClient";
import StoreFrame from "@/components/StoreFrame";

export const metadata: Metadata = {
  title: "Избранное",
};

export default function FavoritesPage() {
  return (
    <StoreFrame>
      <FavoritesPageClient />
    </StoreFrame>
  );
}
