import type { Product } from "@/types/api";
type Fixture = {
  barcode: string;
  name: string;
  brand: string;
  image: string | null;
  ingredients: string | null;
  nutrition: { label: string; value: string }[];
  nutritionBasis: string | null;
};

const fixtures: Fixture[] = [
  {
    barcode: "8901234567890", name: "Classic Rolled Oats", brand: "Demo Pantry",
    image: "/products/oats.svg", ingredients: "Whole grain rolled oats (100%).",
    nutritionBasis: "Per 100 g (sample values)",
    nutrition: [{ label: "Energy", value: "380 kcal" }, { label: "Protein", value: "13 g" }, { label: "Carbohydrate", value: "67 g" }, { label: "Total sugars", value: "1 g" }, { label: "Fat", value: "7 g" }, { label: "Fibre", value: "10 g" }],
  },
  {
    barcode: "8901234567906", name: "Peanut Butter", brand: "Demo Pantry",
    image: "/products/peanut-butter.svg", ingredients: "Roasted peanuts (90%), cane sugar, peanut oil, salt. Contains peanuts.",
    nutritionBasis: "Per 100 g (sample values)",
    nutrition: [{ label: "Energy", value: "600 kcal" }, { label: "Protein", value: "25 g" }, { label: "Fat", value: "50 g" }],
  },
  { barcode: "8901234567913", name: "Tomato Soup", brand: "Demo Kitchen", image: null, ingredients: null, nutritionBasis: null, nutrition: [] },
];

export const mockProducts: Product[] = fixtures.map(({ ingredients, nutrition, nutritionBasis, ...product }) => ({
  ...product,
  source: "mock",
  ingredients: ingredients ? [{ name: ingredients }] : null,
  nutrition: { basis: nutritionBasis, nutrients: nutrition },
}));
