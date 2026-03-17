import type { ProductColor } from "@/types/product";

export type CartItem = {
  id: string;
  productId: number;
  size: string;
  color: ProductColor;
  quantity: number;
  addedAt: string;
};

export type ShopState = {
  cart: CartItem[];
  favorites: number[];
};
