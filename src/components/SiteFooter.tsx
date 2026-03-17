import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="section-kicker">NO WOE</p>
          <p>Минималистичный каталог streetwear-вещей с аккуратной мобильной витриной.</p>
        </div>
        <div className="footer-links">
          <Link href="/">Каталог</Link>
          <Link href="/favorites">Избранное</Link>
          <Link href="/cart">Корзина</Link>
          <Link href="/contacts">Контакты</Link>
        </div>
      </div>
    </footer>
  );
}
