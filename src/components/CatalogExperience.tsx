"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { CloseIcon } from "@/components/icons";
import { filterProducts, getPrimaryFilter } from "@/lib/products";
import type { CatalogSort } from "@/lib/products";
import type { CatalogFilter, FilterSlug, Product } from "@/types/product";

type CatalogExperienceProps = {
  products: Product[];
  filters: CatalogFilter[];
  initialQuery?: string;
  initialFilter?: FilterSlug | null;
  initialSort?: CatalogSort;
};

const filterLabelMap: Record<FilterSlug, string> = {
  anime: "аниме",
  text: "с текстом",
  paired: "парные",
  graphic: "подтекст",
  statement: "лого",
};

export default function CatalogExperience({
  products,
  filters,
  initialQuery = "",
  initialFilter = null,
  initialSort = "newest",
}: CatalogExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<CatalogSort>(initialSort);
  const [activeFilter, setActiveFilter] = useState<FilterSlug | null>(initialFilter);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);

  const visibleProducts = filterProducts(products, {
    query: initialQuery,
    filterSlug: activeFilter,
    sort,
  });

  const filterTags = useMemo(
    () =>
      filters.map((filter) => ({
        ...filter,
        tagLabel: filterLabelMap[filter.slug] ?? filter.slug,
      })),
    [filters],
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (initialQuery) {
      params.set("q", initialQuery);
    } else {
      params.delete("q");
    }

    if (activeFilter) {
      params.set("filter", activeFilter);
    } else {
      params.delete("filter");
    }

    if (sort !== "newest") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    const next = params.toString();
    const current = searchParams.toString();

    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [activeFilter, initialQuery, pathname, router, searchParams, sort]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="catalog-page">
      <section className="catalog-toolbar">
        <button type="button" className="toolbar-button" onClick={() => setFiltersOpen(true)}>
          Фильтры
          {activeFilter ? <span className="toolbar-badge">{filterTags.find((item) => item.slug === activeFilter)?.tagLabel}</span> : null}
        </button>

        <div className="sort-select custom-sort" ref={sortRef}>
          <span>Сортировка</span>
          <button type="button" className={`sort-trigger ${sortOpen ? "is-open" : ""}`} onClick={() => setSortOpen((value) => !value)} aria-expanded={sortOpen}>
            <strong>{sort === "newest" ? "Сначала новые" : "Сначала ранние"}</strong>
            <span className="sort-chevron" aria-hidden>
              +
            </span>
          </button>

          <div className={`sort-popover ${sortOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className={`sort-option ${sort === "newest" ? "is-active" : ""}`}
              onClick={() => {
                setSort("newest");
                setSortOpen(false);
              }}
            >
              Сначала новые
            </button>
            <button
              type="button"
              className={`sort-option ${sort === "oldest" ? "is-active" : ""}`}
              onClick={() => {
                setSort("oldest");
                setSortOpen(false);
              }}
            >
              Сначала ранние
            </button>
          </div>
        </div>
      </section>

      <section className="catalog-results-meta">
        <p className="section-kicker">Каталог</p>
        <strong>{visibleProducts.length} позиций</strong>
      </section>

      {visibleProducts.length > 0 ? (
        <section className="catalog-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} tag={getPrimaryFilter(product)} />
          ))}
        </section>
      ) : (
        <section className="empty-panel">
          <p className="section-kicker">Ничего не найдено</p>
          <h2>Сбрось фильтр или измени запрос.</h2>
          <p>Поиск смотрит в название, описание, состав и ключевые слова товара.</p>
        </section>
      )}

      <div className={`drawer-backdrop ${filtersOpen ? "is-open" : ""}`}>
        <div className="drawer-backdrop-scrim" onClick={() => setFiltersOpen(false)} />
        <div className={`filter-sheet ${filtersOpen ? "is-open" : ""}`} onClick={(event) => event.stopPropagation()}>
          <div className="drawer-head">
            <div className="sheet-heading">
              <strong>Фильтры</strong>
              <p>Выбери один тег. Цвета закреплены за категориями.</p>
            </div>
            <button type="button" className="header-icon-button" onClick={() => setFiltersOpen(false)} aria-label="Закрыть фильтры">
              <CloseIcon className="icon" />
            </button>
          </div>

          <div className="sheet-filter-cloud">
            <button type="button" className={`filter-chip ${activeFilter === null ? "is-active is-neutral" : ""}`} onClick={() => setActiveFilter(null)}>
              все
            </button>
            {filterTags.map((filter) => (
              <button
                key={filter.slug}
                type="button"
                className={`filter-chip ${activeFilter === filter.slug ? "is-active" : ""}`}
                style={
                  {
                    "--filter-color": filter.color,
                    "--filter-text": filter.textColor,
                  } as CSSProperties
                }
                onClick={() => setActiveFilter((value) => (value === filter.slug ? null : filter.slug))}
              >
                {filter.tagLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
