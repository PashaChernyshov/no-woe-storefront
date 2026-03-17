"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, getPrimaryFilter } from "@/lib/products";
import { useShop } from "@/providers/ShopProvider";

export default function FavoritesPageClient() {
  const { state } = useShop();
  const products = getAllProducts().filter((product) => state.favorites.includes(product.id));

  return (
    <div className="saved-page">
      <section className="page-hero compact-page-hero">
        <p className="section-kicker">Избранное</p>
        <h1>Избранное</h1>
        <p>{products.length > 0 ? `${products.length} товаров сохранено.` : "Сохраненных товаров пока нет."}</p>
      </section>

      {products.length > 0 ? (
        <section className="catalog-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} tag={getPrimaryFilter(product)} />
          ))}
        </section>
      ) : (
        <section className="empty-panel">
          <p className="section-kicker">Пока пусто</p>
          <h2>Здесь появятся сохраненные футболки.</h2>
          <p>Добавляй понравившиеся позиции через иконку сердца на карточке товара.</p>
          <Link href="/" className="button button-primary">
            Вернуться в каталог
          </Link>
        </section>
      )}
    </div>
  );
}
