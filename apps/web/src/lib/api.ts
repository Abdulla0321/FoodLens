import type { ApiError, Product } from "@/types/api";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
export const isMockMode = !baseUrl;

export class ApiRequestError extends Error implements ApiError {
  constructor(public code: string, message: string, public status: number) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  const n = p.nutrition as Record<string, unknown> | null;
  return typeof p.barcode === "string" && typeof p.name === "string" && typeof p.brand === "string"
    && (p.image === null || typeof p.image === "string") && (p.source === "mock" || p.source === "api")
    && (p.ingredients === null || (Array.isArray(p.ingredients) && p.ingredients.every((i: unknown) => !!i && typeof i === "object" && "name" in i && typeof i.name === "string")))
    && !!n && (n.basis === null || typeof n.basis === "string") && Array.isArray(n.nutrients)
    && n.nutrients.every((i: unknown) => !!i && typeof i === "object" && "label" in i && typeof i.label === "string" && "value" in i && typeof i.value === "string");
}

async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { headers: { Accept: "application/json" }, cache: "no-store",
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiRequestError("NETWORK_ERROR", "Cannot reach the product service. Check your connection and try again.", 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiRequestError(typeof body?.code === "string" ? body.code : "HTTP_ERROR",
      typeof body?.message === "string" ? body.message : "The product service could not complete this request.", response.status);
  }
  try { return await response.json(); }
  catch { throw new ApiRequestError("INVALID_RESPONSE", "The product service returned an invalid response.", response.status); }
}

export interface ProductService {
  getByBarcode(barcode: string, signal?: AbortSignal): Promise<Product | null>;
  searchByName(query: string, signal?: AbortSignal): Promise<Product[]>;
}

export const productService: ProductService = {
  async getByBarcode(barcode, signal) {
    if (isMockMode) {
      const { mockProducts } = await import("@/data/mock-products");
      return mockProducts.find((product) => product.barcode === barcode) ?? null;
    }
    try {
      const data = await request(`/products/barcode/${encodeURIComponent(barcode)}`, signal);
      if (!isProduct(data)) throw new ApiRequestError("INVALID_RESPONSE", "The product service returned invalid product data.", 200);
      return data;
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) return null;
      throw error;
    }
  },
  async searchByName(query, signal) {
    const term = query.trim();
    if (!term) return [];
    if (isMockMode) {
      const { mockProducts } = await import("@/data/mock-products");
      return mockProducts.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(term.toLowerCase()));
    }
    const data = await request(`/products?name=${encodeURIComponent(term)}`, signal);
    if (!Array.isArray(data) || !data.every(isProduct)) throw new ApiRequestError("INVALID_RESPONSE", "The product service returned invalid search results.", 200);
    return data;
  },
};
