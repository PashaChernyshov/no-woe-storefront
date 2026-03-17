"use client";

import type { MouseEvent } from "react";
import { HeartIcon } from "@/components/icons";
import { useShop } from "@/providers/ShopProvider";

type FavoriteButtonProps = {
  productId: number;
  className?: string;
  showLabel?: boolean;
};

export default function FavoriteButton({ productId, className, showLabel = false }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useShop();
  const active = isFavorite(productId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(productId);
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      className={className ?? `favorite-button ${active ? "is-active" : ""}`}
      onClick={handleClick}
    >
      <HeartIcon className="icon" />
      {showLabel ? <span>{active ? "Сохранено" : "В избранное"}</span> : null}
    </button>
  );
}
