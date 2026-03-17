import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import StoreFrame from "@/components/StoreFrame";

export const metadata: Metadata = {
  title: "Контакты",
};

export default function ContactsPage() {
  return (
    <StoreFrame>
      <InfoPage
        overline="Contacts"
        title="Контакты бренда"
        intro="Отдельная страница для всех каналов связи, чтобы каталог не перегружался служебной информацией."
      >
        <section className="info-grid">
          <article className="info-card">
            <h2>Email</h2>
            <p>hello@nowoe.ru</p>
          </article>
          <article className="info-card">
            <h2>Telegram</h2>
            <p>@nowoe_brand</p>
          </article>
          <article className="info-card">
            <h2>Время ответа</h2>
            <p>Понедельник-воскресенье, с 11:00 до 21:00 по Москве.</p>
          </article>
        </section>
      </InfoPage>
    </StoreFrame>
  );
}
