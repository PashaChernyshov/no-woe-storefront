export type ProductColor = "black" | "white";

export type FilterSlug = "anime" | "text" | "paired" | "graphic" | "statement";

export type SizeMeasurement = {
  size: string;
  chest: string;
  length: string;
  sleeve: string;
};

export type CatalogFilter = {
  slug: FilterSlug;
  label: string;
  description: string;
  color: string;
  surface: string;
  textColor: string;
};

export type Product = {
  id: number;
  sortOrder: number;
  slug: string;
  name: string;
  price: number;
  releaseDate: string;
  category: "Футболки";
  fit: string;
  description: string;
  shortDescription: string;
  composition: string;
  sizeNote: string;
  sizes: string[];
  availableColors: ProductColor[];
  filters: FilterSlug[];
  searchKeywords: string[];
  images: Record<ProductColor, string>;
  measurements: SizeMeasurement[];
};
