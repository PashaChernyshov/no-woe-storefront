import type { Metadata } from "next";
import CartPageClient from "@/components/CartPageClient";
import StoreFrame from "@/components/StoreFrame";

export const metadata: Metadata = {
  title: "Корзина",
};

export default function CartPage() {
  return (
    <StoreFrame>
      <CartPageClient />
    </StoreFrame>
  );
}
