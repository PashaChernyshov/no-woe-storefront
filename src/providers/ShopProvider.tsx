"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ProductColor } from "@/types/product";
import type { CartItem, ShopState } from "@/types/shop";

type ShopContextValue = {
  state: ShopState;
  addToCart: (payload: { productId: number; size: string; color: ProductColor; quantity?: number }) => void;
  updateCartItem: (itemId: string, patch: Partial<Pick<CartItem, "size" | "color" | "quantity">>) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
};

const STORAGE_KEY = "no-woe-store";

const defaultState: ShopState = {
  cart: [],
  favorites: [],
};

const ShopContext = createContext<ShopContextValue | null>(null);

function createCartItemId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ShopState;
        setState({
          cart: parsed.cart ?? [],
          favorites: parsed.favorites ?? [],
        });
      }
    } catch {
      setState(defaultState);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const value: ShopContextValue = {
    state,
    addToCart: ({ productId, size, color, quantity = 1 }) => {
      setState((current) => {
        const existing = current.cart.find((item) => item.productId === productId && item.size === size && item.color === color);

        if (existing) {
          return {
            ...current,
            cart: current.cart.map((item) =>
              item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item,
            ),
          };
        }

        return {
          ...current,
          cart: [
            ...current.cart,
            {
              id: createCartItemId(),
              productId,
              size,
              color,
              quantity,
              addedAt: new Date().toISOString(),
            },
          ],
        };
      });
    },
    updateCartItem: (itemId, patch) => {
      setState((current) => {
        const nextCart = current.cart.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          return {
            ...item,
            ...patch,
            quantity: patch.quantity ? Math.max(1, patch.quantity) : item.quantity,
          };
        });

        const updatedItem = nextCart.find((item) => item.id === itemId);
        if (!updatedItem) {
          return current;
        }

        const duplicate = nextCart.find(
          (item) =>
            item.id !== updatedItem.id &&
            item.productId === updatedItem.productId &&
            item.size === updatedItem.size &&
            item.color === updatedItem.color,
        );

        if (!duplicate) {
          return {
            ...current,
            cart: nextCart,
          };
        }

        return {
          ...current,
          cart: nextCart
            .filter((item) => item.id !== updatedItem.id)
            .map((item) => (item.id === duplicate.id ? { ...item, quantity: item.quantity + updatedItem.quantity } : item)),
        };
      });
    },
    removeCartItem: (itemId) => {
      setState((current) => ({
        ...current,
        cart: current.cart.filter((item) => item.id !== itemId),
      }));
    },
    clearCart: () => {
      setState((current) => ({ ...current, cart: [] }));
    },
    toggleFavorite: (productId) => {
      setState((current) => {
        const hasProduct = current.favorites.includes(productId);
        return {
          ...current,
          favorites: hasProduct
            ? current.favorites.filter((id) => id !== productId)
            : [...current.favorites, productId],
        };
      });
    },
    isFavorite: (productId) => state.favorites.includes(productId),
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
