export interface Ingredient { name: string }
export interface Nutrition {
  basis: string | null;
  nutrients: { label: string; value: string }[];
}
export interface Product {
  barcode: string;
  name: string;
  brand: string;
  image: string | null;
  ingredients: Ingredient[] | null;
  nutrition: Nutrition;
  source: "mock" | "api";
}
export interface ApiError { code: string; message: string; status: number }
