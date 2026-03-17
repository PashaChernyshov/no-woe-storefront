"use client";

import Image from "next/image";
import type { CSSProperties, MouseEvent, TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import { formatPrice, getPrimaryFilter } from "@/lib/products";
import { useShop } from "@/providers/ShopProvider";
import type { Product } from "@/types/product";

type ProductPurchasePanelProps = {
  product: Product;
};

function getTagLabel(slug: Product["filters"][number], fallback: string) {
  switch (slug) {
    case "graphic":
      return "Подтекст";
    case "statement":
      return "Лого";
    default:
      return fallback;
  }
}

export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addToCart } = useShop();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [motionDirection, setMotionDirection] = useState<"next" | "prev">("next");
  const resetRef = useRef<number | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const colors = product.availableColors;
  const activeColor = colors[activeIndex] ?? "black";
  const tag = getPrimaryFilter(product);

  useEffect(() => {
    return () => {
      if (resetRef.current) {
        window.clearTimeout(resetRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!viewerOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewerOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [viewerOpen]);

  const showPrevious = () => {
    setMotionDirection("prev");
    setActiveIndex((value) => (value - 1 + colors.length) % colors.length);
  };

  const showNext = () => {
    setMotionDirection("next");
    setActiveIndex((value) => (value + 1) % colors.length);
  };

  const selectColor = (index: number) => {
    setMotionDirection(index > activeIndex ? "next" : "prev");
    setActiveIndex(index);
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      color: activeColor,
      size: selectedSize,
      quantity,
    });

    setAdded(true);

    if (resetRef.current) {
      window.clearTimeout(resetRef.current);
    }

    resetRef.current = window.setTimeout(() => setAdded(false), 1400);
  };

  const handleGalleryTouchStart = (event: TouchEvent<HTMLButtonElement>) => {
    touchStartRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleGalleryTouchEnd = (event: TouchEvent<HTMLButtonElement>) => {
    if (touchStartRef.current === null) {
      return;
    }

    const delta = event.changedTouches[0]?.clientX - touchStartRef.current;
    touchStartRef.current = null;

    if (Math.abs(delta) < 20) {
      return;
    }

    if (delta < 0) {
      showNext();
      return;
    }

    showPrevious();
  };

  const handlePreviousClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    showPrevious();
  };

  const handleNextClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    showNext();
  };

  const openViewer = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setViewerOpen(true);
  };

  return (
    <>
      <div className="product-page">
        <section className="product-gallery">
          <div className="product-gallery-main gallery-stage">
            {colors.length > 1 ? (
              <>
                <button type="button" className="gallery-nav gallery-nav-prev" onClick={handlePreviousClick} aria-label="Предыдущее фото">
                  <ChevronLeftIcon className="icon" />
                </button>
                <button type="button" className="gallery-nav gallery-nav-next" onClick={handleNextClick} aria-label="Следующее фото">
                  <ChevronRightIcon className="icon" />
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="product-gallery-launch"
              onClick={openViewer}
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
              aria-label="Открыть фото товара"
            >
              <Image
                key={`${product.slug}-${activeColor}`}
                src={product.images[activeColor]}
                alt={product.name}
                width={1600}
                height={1600}
                className={`product-detail-image image-motion image-motion-${motionDirection}`}
                priority
              />
            </button>
          </div>

          <div className="gallery-dots" aria-label="Галерея товара">
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

          <div className="product-gallery-strip">
            {colors.map((color, index) => (
              <button
                key={color}
                type="button"
                className={`gallery-swatch ${activeIndex === index ? "is-active" : ""}`}
                onClick={() => selectColor(index)}
                aria-label={color === "black" ? "Черный" : "Белый"}
              >
                <Image src={product.images[color]} alt={`${product.name} ${color}`} width={320} height={320} className="gallery-swatch-image" />
              </button>
            ))}
          </div>
        </section>

        <section className="product-panel">
          <div className="product-heading">
            <div className="product-heading-copy">
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
                {getTagLabel(tag.slug, tag.label)}
              </span>
              <h1>{product.name}</h1>
              <strong className="product-page-price">{formatPrice(product.price)}</strong>
            </div>
            <FavoriteButton productId={product.id} className="favorite-button product-favorite" />
          </div>

          <div className="selector-block">
            <span>Цвет</span>
            <div className="selector-row">
              {colors.map((color, index) => (
                <button
                  key={color}
                  type="button"
                  className={`selector-chip ${activeIndex === index ? "is-active" : ""}`}
                  onClick={() => selectColor(index)}
                >
                  {color === "black" ? "Черный" : "Белый"}
                </button>
              ))}
            </div>
          </div>

          <div className="selector-block">
            <span>Размер</span>
            <div className="selector-row">
              {product.sizes.map((size) => (
                <button key={size} type="button" className={`selector-chip ${selectedSize === size ? "is-active" : ""}`} onClick={() => setSelectedSize(size)}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="purchase-row">
            <div className="quantity-stepper">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => value + 1)}>
                +
              </button>
            </div>

            <button type="button" className="button button-muted button-wide" onClick={handleAddToCart}>
              {added ? "Добавлено в корзину" : "В корзину"}
            </button>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-meta-stack">
            <div className="product-meta-item">
              <span>Посадка</span>
              <p>{product.fit}</p>
            </div>
            <div className="product-meta-item">
              <span>Состав</span>
              <p>{product.composition}</p>
            </div>
          </div>

          <section className="size-table">
            <div className="size-table-head">
              <h2>Таблица размеров</h2>
              <p>
                A - длина от верхнего шва на плече до нижнего края футболки. B - ширина по футболке от левого края до правого края,
                не обхват. C - длина рукава от плечевого шва до низа рукава.
              </p>
              <p>{product.sizeNote}</p>
            </div>
            <div className="size-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Размер</th>
                    <th>A - длина</th>
                    <th>B - ширина</th>
                    <th>C - рукав</th>
                  </tr>
                </thead>
                <tbody>
                  {product.measurements.map((row) => (
                    <tr key={row.size}>
                      <td>{row.size}</td>
                      <td>{row.chest}</td>
                      <td>{row.length}</td>
                      <td>{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>

      <div className={`image-viewer ${viewerOpen ? "is-open" : ""}`} onClick={() => setViewerOpen(false)}>
        <div className="image-viewer-dialog" onClick={(event) => event.stopPropagation()}>
          {colors.length > 1 ? (
            <>
              <button type="button" className="gallery-nav gallery-nav-prev image-viewer-nav" onClick={handlePreviousClick} aria-label="Предыдущее фото">
                <ChevronLeftIcon className="icon" />
              </button>
              <button type="button" className="gallery-nav gallery-nav-next image-viewer-nav" onClick={handleNextClick} aria-label="Следующее фото">
                <ChevronRightIcon className="icon" />
              </button>
            </>
          ) : null}
          <button type="button" className="header-icon-button image-viewer-close" onClick={() => setViewerOpen(false)} aria-label="Закрыть просмотр">
            <CloseIcon className="icon" />
          </button>
          <Image
            key={`viewer-${product.slug}-${activeColor}`}
            src={product.images[activeColor]}
            alt={product.name}
            width={1800}
            height={1800}
            className={`image-viewer-photo image-motion image-motion-${motionDirection}`}
          />
        </div>
      </div>
    </>
  );
}
