"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, MouseEvent, TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import { formatPrice } from "@/lib/products";
import { useShop } from "@/providers/ShopProvider";
import type { CatalogFilter, Product, ProductColor } from "@/types/product";

type ProductCardProps = {
  product: Product;
  tag: CatalogFilter;
};

function getTagLabel(tag: CatalogFilter) {
  switch (tag.slug) {
    case "graphic":
      return "Подтекст";
    case "statement":
      return "Лого";
    default:
      return tag.label;
  }
}

export default function ProductCard({ product, tag }: ProductCardProps) {
  const { addToCart } = useShop();
  const [activeIndex, setActiveIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [motionDirection, setMotionDirection] = useState<"next" | "prev">("next");
  const touchStartRef = useRef<number | null>(null);
  const resetRef = useRef<number | null>(null);
  const colors = product.availableColors;
  const activeColor = colors[activeIndex] ?? "black";

  useEffect(() => {
    return () => {
      if (resetRef.current) {
        window.clearTimeout(resetRef.current);
      }
    };
  }, []);

  const selectColor = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, colors.length - 1));
    setMotionDirection(nextIndex > activeIndex ? "next" : "prev");
    setActiveIndex(nextIndex);
  };

  const handleTouchStart = (event: TouchEvent<HTMLAnchorElement>) => {
    touchStartRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLAnchorElement>) => {
    if (touchStartRef.current === null) {
      return;
    }

    const delta = event.changedTouches[0]?.clientX - touchStartRef.current;
    touchStartRef.current = null;

    if (Math.abs(delta) < 24) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (delta < 0) {
      selectColor(activeIndex + 1);
      return;
    }

    selectColor(activeIndex - 1);
  };

  const handleQuickAdd = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    addToCart({
      productId: product.id,
      size: product.sizes[1] ?? product.sizes[0] ?? "",
      color: activeColor as ProductColor,
      quantity: 1,
    });

    setAdded(true);
    setAddedCount((value) => value + 1);

    if (resetRef.current) {
      window.clearTimeout(resetRef.current);
    }

    resetRef.current = window.setTimeout(() => {
      setAdded(false);
      setAddedCount(0);
    }, 1200);
  };

  return (
    <article className="product-card">
      <div className="product-card-topline">
        <span
          className="product-mini-tag"
          style={
            {
              "--tag-bg": tag.color,
              "--tag-surface": tag.surface,
              "--tag-text": tag.textColor,
            } as CSSProperties
          }
        >
          {getTagLabel(tag)}
        </span>
        <FavoriteButton productId={product.id} />
      </div>

      <div className="product-media gallery-stage">
        <Link
          href={`/catalog/${product.slug}`}
          className="product-media-link"
          aria-label={product.name}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            key={`${product.slug}-${activeColor}`}
            src={product.images[activeColor]}
            alt={product.name}
            width={1200}
            height={1200}
            className={`product-image image-motion image-motion-${motionDirection}`}
          />

          {colors.length > 1 ? (
            <div className="card-hover-switchers" aria-hidden="true">
              <span className="card-hover-zone card-hover-zone-left" onMouseEnter={() => selectColor(0)} />
              <span className="card-hover-zone card-hover-zone-right" onMouseEnter={() => selectColor(1)} />
            </div>
          ) : null}
        </Link>
      </div>

      <div className="card-dots" aria-label="Варианты цвета">
        {colors.map((color, index) => (
          <button
            key={color}
            type="button"
            className={`card-dot ${activeIndex === index ? "is-active" : ""}`}
            onClick={() => selectColor(index)}
            aria-label={color === "black" ? "Черный" : "Белый"}
          />
        ))}
      </div>

      <div className="product-card-copy">
        <h3>{product.name}</h3>
        <strong>{formatPrice(product.price)}</strong>
      </div>

      <div className="add-feedback-wrap">
        <button type="button" className={`button button-muted button-wide ${added ? "is-added" : ""}`} onClick={handleQuickAdd}>
          {added ? "Добавлено" : "В корзину"}
        </button>
        {added ? <span className="add-feedback-badge">+{addedCount}</span> : null}
      </div>
    </article>
  );
}
