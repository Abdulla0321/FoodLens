# FoodLens product API contract (frontend integration draft)

This contract describes the frontend's expected FastAPI responses. No backend is implemented here. Paths are relative to `NEXT_PUBLIC_API_BASE_URL` (for example `http://localhost:8000`). No implicit `/api` prefix is appended. Confirm this draft with backend development before connecting.

## Endpoints

| Request | Success | Missing/invalid data |
| --- | --- | --- |
| `GET /products/barcode/{barcode}` | 200: Product object | 404: ApiError; 422: invalid barcode |
| `GET /products?name={encodedQuery}` | 200: Product array | 200: `[]` for no matches; 422: invalid query |

Barcodes are strings (retain leading zeros), with 8, 12, 13, or 14 numeric digits. Frontend entry strips spaces and hyphens before lookup; this validates format, not checksum or authenticity. Name searches trim whitespace and encode query parameters. No authentication is assumed in this phase.

## Product response

```json
{
  "barcode": "8901234567890",
  "name": "Classic Rolled Oats",
  "brand": "Demo Pantry",
  "image": "/products/oats.svg",
  "ingredients": [{ "name": "Whole grain rolled oats (100%)." }],
  "nutrition": {
    "basis": "Per 100 g (sample values)",
    "nutrients": [{ "label": "Energy", "value": "380 kcal" }]
  },
  "source": "mock"
}
```

The example is fictional mock data. Real backend responses use `source: "api"`; backend fixtures must retain `source: "mock"`. All fields are required. `image`, `ingredients`, and nutrition `basis` can be null. An empty ingredients array means no available ingredient information. Unknown nutrients are omitted, never represented as zero. Nutrition values include their units; `basis` explains the serving or reference amount. Ingredient names preserve label text; they do not imply ingredient risk analysis.

Images must be public HTTPS URLs or frontend-relative asset paths; backend-relative image paths must be converted to absolute URLs by the backend. Image optimization is disabled for these externally supplied URLs. Missing image data uses a placeholder.

The interfaces Product, Ingredient, Nutrition and ApiError live in [api.ts](../apps/web/src/types/api.ts). Product payloads are checked at runtime before rendering. No food safety rating or adulteration status is part of this contract.

## Errors

Return a non-2xx HTTP status and this JSON shape:

```json
{ "code": "PRODUCT_NOT_FOUND", "message": "Product not found.", "status": 404 }
```

The frontend trusts the HTTP status for error classification. Barcode lookup 404 becomes the missing-product state. Other failures surface an error with retry. FastAPI's default 422 `{ "detail": [...] }`, non-JSON errors and missing error fields receive a generic message. Failed requests time out after 15 seconds; network/timeouts use frontend code `NETWORK_ERROR`, status 0. Malformed successful responses use `INVALID_RESPONSE`. API failure never silently falls back to mock data.

## Frontend configuration

Leave `NEXT_PUBLIC_API_BASE_URL` unset/empty for mock mode. To connect, set it in `apps/web/.env.local`, restart development, and rebuild production (NEXT_PUBLIC values are embedded at build time). The value is public; never include secrets. The FastAPI service must allow the frontend origin via CORS. No backend or CORS configuration is changed in this frontend phase.

UI routes use `/product/{barcode}`; earlier `/product?barcode=...` links remain supported.
