export { productService, ApiRequestError, isMockMode } from "./api";
export type { Product } from "@/types/api";

export function normalizeBarcode(value: string): string | null {
  const barcode = value.replace(/[\s-]/g, "");
  return /^(\d{8}|\d{12,14})$/.test(barcode) ? barcode : null;
}
