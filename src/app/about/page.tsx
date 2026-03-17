import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import StoreFrame from "@/components/StoreFrame";

export const metadata: Metadata = {
  title: "О бренде",
};

export default function AboutPage() {
  return (
    <StoreFrame>
      <InfoPage
        overline="About brand"
        title="NO WOE строит спокойный streetwear без визуального мусора."
        intro="Бренд собирает вещи вокруг чистой формы, плотных тканей, сильной типографики и графики, которая выглядит модно, а не случайно."
      >
        <section className="info-grid">
          <article className="info-card">
            <h2>Что важно</h2>
            <p>Плотные футболки, хороший oversize, чистая конструкция и акценты, которые держат образ без перегруза.</p>
          </article>
          <article className="info-card">
            <h2>Как мы думаем о вещах</h2>
            <p>Каждая модель должна работать в повседневном гардеробе, а не только на промо-фото. Поэтому база остается спокойной, а акцент уходит в принт и посадку.</p>
          </article>
          <article className="info-card">
            <h2>Что дальше</h2>
            <p>Архитектура уже подготовлена под простой checkout без личного кабинета, сбор контактов и передачу заказов в Google Таблицу.</p>
          </article>
        </section>
      </InfoPage>
    </StoreFrame>
  );
}
