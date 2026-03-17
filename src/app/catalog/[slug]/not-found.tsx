import Link from "next/link";
import StoreFrame from "@/components/StoreFrame";

export default function NotFound() {
  return (
    <StoreFrame>
      <section className="empty-panel not-found-panel">
        <p className="section-kicker">404</p>
        <h2>Товар не найден.</h2>
        <p>Позиция больше не доступна или была перемещена внутри каталога.</p>
        <Link href="/" className="button button-primary">
          Вернуться в каталог
        </Link>
      </section>
    </StoreFrame>
  );
}
