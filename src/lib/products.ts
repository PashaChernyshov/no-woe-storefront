import { catalogFilters, products } from "@/data/products";
import type { CatalogFilter, FilterSlug, Product } from "@/types/product";

export type CatalogSort = "newest" | "oldest";

export function getAllProducts(): Product[] {
  return sortProducts(products, "newest");
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByIds(ids: number[]) {
  const idSet = new Set(ids);
  return getAllProducts().filter((product) => idSet.has(product.id));
}

export function getCatalogFilters(): CatalogFilter[] {
  return catalogFilters;
}

export function getFilterBySlug(slug: FilterSlug) {
  return catalogFilters.find((filter) => filter.slug === slug) ?? catalogFilters[0];
}

export function getPrimaryFilter(product: Product): CatalogFilter {
  return getFilterBySlug(product.filters[0] ?? catalogFilters[0].slug);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

export function sortProducts(items: Product[], sort: CatalogSort) {
  const next = [...items];

  switch (sort) {
    case "oldest":
      return next.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    case "newest":
    default:
      return next.sort((a, b) => b.sortOrder - a.sortOrder || b.id - a.id);
  }
}

export function filterProducts(
  items: Product[],
  {
    query,
    filterSlug,
    sort,
  }: {
    query: string;
    filterSlug: FilterSlug | null;
    sort: CatalogSort;
  },
) {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = items.filter((product) => {
    const matchesFilter = filterSlug ? product.filters.includes(filterSlug) : true;
    if (!matchesFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      product.name,
      product.shortDescription,
      product.description,
      product.composition,
      product.fit,
      ...product.filters,
      ...product.searchKeywords,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  return sortProducts(filtered, sort);
}
