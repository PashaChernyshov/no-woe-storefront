"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { formatPrice, getAllProducts } from "@/lib/products";
import { useShop } from "@/providers/ShopProvider";

export default function CartPageClient() {
  const router = useRouter();
  const { state, updateCartItem, removeCartItem, clearCart } = useShop();
  const touchStartRef = useRef<{ x: number; y: number; edge: "left" | "right" | null } | null>(null);
  const products = getAllProducts();
  const lines = state.cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        return null;
      }

      return {
        item,
        product,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const delivery = lines.length > 0 ? 490 : 0;
  const total = subtotal + delivery;

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    const edgeThreshold = 28;
    const edge =
      touch.clientX <= edgeThreshold
        ? "left"
        : window.innerWidth - touch.clientX <= edgeThreshold
          ? "right"
          : null;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      edge,
    };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current?.edge) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const fromLeft = touchStartRef.current.edge === "left" && deltaX > 72;
    const fromRight = touchStartRef.current.edge === "right" && deltaX < -72;

    touchStartRef.current = null;

    if (deltaY > 48 || (!fromLeft && !fromRight)) {
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <div className="cart-page" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <section className="cart-main">
        <section className="page-hero compact-page-hero">
          <p className="section-kicker">Корзина</p>
          <h1>Корзина</h1>
          <p>{lines.length > 0 ? `${lines.length} позиций в заказе.` : "Пока пусто."}</p>
        </section>

        {lines.length > 0 ? (
          <div className="cart-list">
            {lines.map((line) => (
              <article key={line.item.id} className="cart-item">
                <div className="cart-item-media">
                  <Image src={line.product.images[line.item.color]} alt={line.product.name} width={900} height={1100} className="cart-item-image" />
                </div>

                <div className="cart-item-body">
                  <div className="cart-item-head">
                    <div>
                      <h2>{line.product.name}</h2>
                      <p>{formatPrice(line.product.price)}</p>
                    </div>
                    <button type="button" className="text-button" onClick={() => removeCartItem(line.item.id)}>
                      Удалить
                    </button>
                  </div>

                  <div className="cart-item-grid">
                    <label>
                      <span>Размер</span>
                      <select value={line.item.size} onChange={(event) => updateCartItem(line.item.id, { size: event.target.value })}>
                        {line.product.sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Цвет</span>
                      <select value={line.item.color} onChange={(event) => updateCartItem(line.item.id, { color: event.target.value as "black" | "white" })}>
                        <option value="black">Черный</option>
                        <option value="white">Белый</option>
                      </select>
                    </label>

                    <label>
                      <span>Количество</span>
                      <select value={line.item.quantity} onChange={(event) => updateCartItem(line.item.id, { quantity: Number(event.target.value) })}>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="cart-item-total">
                    <span>Итого</span>
                    <strong>{formatPrice(line.lineTotal)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="empty-panel">
            <p className="section-kicker">Пусто</p>
            <h2>Корзина пока пустая.</h2>
            <p>Добавь футболки из каталога, чтобы перейти к следующему шагу оформления.</p>
            <Link href="/" className="button button-primary">
              Открыть каталог
            </Link>
          </section>
        )}
      </section>

      <aside className="checkout-card">
        <div className="checkout-head">
          <p className="section-kicker">Оформление</p>
          <h2>Сводка заказа</h2>
          <p>Страница уже подготовлена под простой сбор контактов без регистрации.</p>
        </div>

        <div className="summary-row">
          <span>Товары</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <div className="summary-row">
          <span>Доставка</span>
          <strong>{formatPrice(delivery)}</strong>
        </div>
        <div className="summary-row summary-row-total">
          <span>К оплате</span>
          <strong>{formatPrice(total)}</strong>
        </div>

        <form className="checkout-form">
          <label>
            <span>Имя</span>
            <input type="text" placeholder="Как к тебе обращаться" />
          </label>
          <label>
            <span>Телефон или Telegram</span>
            <input type="text" placeholder="+7... или @username" />
          </label>
          <label>
            <span>Город</span>
            <input type="text" placeholder="Москва" />
          </label>
        </form>

        <button type="button" className="button button-primary button-wide" disabled={lines.length === 0}>
          Оформление как следующий этап
        </button>
        <button type="button" className="button button-secondary button-wide" onClick={clearCart} disabled={lines.length === 0}>
          Очистить корзину
        </button>
      </aside>
    </div>
  );
}
