import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import StoreFrame from "@/components/StoreFrame";

export const metadata: Metadata = {
  title: "Оплата",
};

export default function PaymentPage() {
  return (
    <StoreFrame>
      <InfoPage
        overline="Payment"
        title="Оплата без лишней сложности"
        intro="На текущем этапе фронтенд уже подготовлен под сбор контактов клиента. Дальше можно быстро подключить подтверждение заказа менеджером или платежный провайдер."
      >
        <section className="info-grid">
          <article className="info-card">
            <h2>Сценарий сейчас</h2>
            <p>Покупатель собирает корзину, оставляет контакты и переходит к следующему шагу оформления без регистрации и личного кабинета.</p>
          </article>
          <article className="info-card">
            <h2>Что можно подключить дальше</h2>
            <p>ЮKassa, CloudPayments, T-Bank эквайринг или ручную обработку заказа через Google Таблицу и менеджера.</p>
          </article>
          <article className="info-card">
            <h2>Безопасность</h2>
            <p>Сейчас чувствительные платежные данные не собираются. Интерфейс готовит заказ и контактные данные для следующего этапа.</p>
          </article>
        </section>
      </InfoPage>
    </StoreFrame>
  );
}
