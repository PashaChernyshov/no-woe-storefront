import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import StoreFrame from "@/components/StoreFrame";

export const metadata: Metadata = {
  title: "Доставка",
};

export default function DeliveryPage() {
  return (
    <StoreFrame>
      <InfoPage
        overline="Delivery"
        title="Доставка по России и СНГ"
        intro="Раздел уже собран как отдельная понятная страница, чтобы каталог оставался чистым, а служебная информация не мешала покупкам."
      >
        <section className="info-grid">
          <article className="info-card">
            <h2>Москва и Санкт-Петербург</h2>
            <p>Курьерская доставка 1-2 дня после подтверждения заказа. Для покупателя можно позже добавить трек или ссылку на курьерскую службу.</p>
          </article>
          <article className="info-card">
            <h2>Остальные города</h2>
            <p>СДЭК или Boxberry. Средний срок 2-6 рабочих дней в зависимости от региона.</p>
          </article>
          <article className="info-card">
            <h2>Стоимость</h2>
            <p>Базовая доставка уже вынесена в корзину отдельной строкой. Позже ее легко сделать динамической по городу и способу доставки.</p>
          </article>
        </section>
      </InfoPage>
    </StoreFrame>
  );
}
