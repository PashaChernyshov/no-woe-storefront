import CatalogExperience from "@/components/CatalogExperience";
import StoreFrame from "@/components/StoreFrame";
import { getAllProducts, getCatalogFilters } from "@/lib/products";
import type { CatalogSort } from "@/lib/products";
import type { FilterSlug } from "@/types/product";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function pickValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolved = (await searchParams) ?? {};
  const initialQuery = pickValue(resolved.q) ?? "";
  const filterValue = pickValue(resolved.filter);
  const sortValue = pickValue(resolved.sort);
  const initialFilter = (filterValue as FilterSlug | undefined) ?? null;
  const initialSort = sortValue === "oldest" ? ("oldest" as CatalogSort) : ("newest" as CatalogSort);

  return (
    <StoreFrame>
      <CatalogExperience
        products={getAllProducts()}
        filters={getCatalogFilters()}
        initialQuery={initialQuery}
        initialFilter={initialFilter}
        initialSort={initialSort}
      />
    </StoreFrame>
  );
}
