import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import StoreFrame from "@/components/StoreFrame";

export const metadata: Metadata = {
  title: "FAQ",
};

const items = [
  {
    question: "Все размеры доступны?",
    answer: "Да. На текущем этапе все модели считаются доступными во всех размерах от XS до XXL.",
  },
  {
    question: "Какие цвета доступны?",
    answer: "Каждая футболка доступна в двух базовых цветах: черный и белый. Выбор цвета уже встроен в карточку товара и корзину.",
  },
  {
    question: "Можно оформить заказ без личного кабинета?",
    answer: "Да. Личный кабинет здесь не нужен. Сценарий строится вокруг быстрого оформления с контактами покупателя.",
  },
  {
    question: "Как работает поиск?",
    answer: "Поиск смотрит в название, описание, посадку, состав и массив searchKeywords, который можно дополнять вручную для каждого товара.",
  },
];

export default function FaqPage() {
  return (
    <StoreFrame>
      <InfoPage overline="FAQ" title="Частые вопросы" intro="Короткий и чистый блок с ответами на основные вопросы по каталогу, оплате, доставке и доступности товаров.">
        <section className="faq-list">
          {items.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      </InfoPage>
    </StoreFrame>
  );
}
