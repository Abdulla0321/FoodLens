# FoodLens API contract

**Status:** Contract proposal for frontend and backend alignment. `GET /health` and both product endpoints are agreed routes; this document does not assert that they are implemented. `POST /api/assessments` is a future endpoint and is not implemented.

## Conventions

- Base URL is deployment-specific. Examples use `http://localhost:8000`.
- Requests and JSON responses use UTF-8. JSON response bodies use `Content-Type: application/json`.
- Barcode values are path segments and must be URL-encoded when necessary. Search `q` is URL-encoded.
- Timestamps, when present, use ISO 8601 UTC strings.
- A successful response has a 2xx status. Errors use the common envelope below.

## Product representation

Product objects returned by lookup and search have this shape:

```json
{
  "barcode": "0123456789012",
  "name": "Example oat drink",
  "brand": "Example Foods",
  "image_url": "https://images.example.test/products/0123456789012.jpg",
  "ingredients": [
    { "name": "Oats", "quantity": null },
    { "name": "Water", "quantity": null }
  ],
  "nutrition": {
    "basis": "100ml",
    "energy_kcal": 46,
    "sugars_g": 3.2,
    "fat_g": 1.5,
    "saturated_fat_g": 0.2,
    "sodium_mg": 40
  },
  "source": {
    "name": "Example product catalogue",
    "url": "https://catalogue.example.test/products/0123456789012",
    "retrieved_at": "2026-11-08T10:00:00Z"
  },
  "data_status": "complete"
}
```

Field definitions:

| Field | Type | Meaning |
| --- | --- | --- |
| `barcode` | string | Product barcode, retained as a string to preserve leading zeroes. |
| `name` | string or `null` | Product name. |
| `brand` | string or `null` | Brand when known. |
| `image_url` | string (URL) or `null` | Publicly accessible product image URL when known. |
| `ingredients` | array | Ingredient records, in source label order when available. Each record has `name` (string) and `quantity` (number or `null`). Quantity is in the source-declared unit; no unit is implied by this contract. |
| `nutrition` | object or `null` | Nutrition values. `basis` is exactly `100g` or `100ml`; energy is kcal, sugars/fat/saturated fat are grams, and sodium is milligrams. Each numeric value can be `null` when absent in the source. |
| `source` | object or `null` | Provenance for the returned product record. `name` is the source label; `url` and `retrieved_at` may be `null` if unavailable. |
| `data_status` | string | Completeness indicator. Proposed values: `complete`, `partial`, `unavailable`. |

Missing information is represented explicitly as `null` for scalar fields and unknown numeric nutrition/ingredient quantities. An empty `ingredients` array means no ingredient records are available; it does not assert that the product contains no ingredients. A `nutrition` value of `null` means no nutrition panel is available; individual `null` values mean that specific nutrient was not supplied. `data_status` is `partial` when the record exists but one or more expected fields are absent, `complete` when the requested product fields are populated, and `unavailable` only when the source reports the product record but usable product details are unavailable. A barcode with no matching product returns 404, rather than a fabricated empty product.

## Endpoints

### `GET /health`

Liveness check. Returns 200 when the API process can serve requests. This check does not necessarily verify dependencies such as the product data provider.

Example:

```http
GET /health HTTP/1.1
Host: localhost:8000
Accept: application/json
```

```json
{ "status": "ok" }
```

### `GET /api/products/{barcode}`

Looks up one product by barcode.

| Status | Meaning |
| --- | --- |
| `200 OK` | Product found; body is one Product object. |
| `400 Bad Request` | Empty or malformed barcode. |
| `404 Not Found` | No product record matches the barcode. |
| `502 Bad Gateway` | An upstream product data source failed or returned an unusable response. |
| `503 Service Unavailable` | API or required dependency is temporarily unavailable. |

Example:

```http
GET /api/products/0123456789012 HTTP/1.1
Host: localhost:8000
Accept: application/json
```

```json
{
  "barcode": "0123456789012",
  "name": "Example oat drink",
  "brand": "Example Foods",
  "image_url": null,
  "ingredients": [{ "name": "Oats", "quantity": null }],
  "nutrition": {
    "basis": "100ml",
    "energy_kcal": 46,
    "sugars_g": 3.2,
    "fat_g": 1.5,
    "saturated_fat_g": 0.2,
    "sodium_mg": null
  },
  "source": {
    "name": "Example product catalogue",
    "url": null,
    "retrieved_at": "2026-11-08T10:00:00Z"
  },
  "data_status": "partial"
}
```

### `GET /api/products/search?q={query}`

Searches product records by text. `q` is required, trimmed, and URL-encoded. The proposed response is an object containing the normalized query, a list of Product objects, and pagination metadata. An empty result is a successful search with an empty `products` array.

Proposed parameters:

| Parameter | Type | Meaning |
| --- | --- | --- |
| `q` | string | Search text; required and non-empty after trimming. |
| `limit` | integer | Optional page size; proposed default 20, maximum 100. |
| `offset` | integer | Optional zero-based result offset; proposed default 0. |

| Status | Meaning |
| --- | --- |
| `200 OK` | Search completed, including zero matches. |
| `400 Bad Request` | Missing/blank `q` or invalid pagination value. |
| `502 Bad Gateway` | Upstream product search failed or returned an unusable response. |
| `503 Service Unavailable` | API or required dependency is temporarily unavailable. |

Example:

```http
GET /api/products/search?q=oat%20drink&limit=20&offset=0 HTTP/1.1
Host: localhost:8000
Accept: application/json
```

```json
{
  "query": "oat drink",
  "products": [
    {
      "barcode": "0123456789012",
      "name": "Example oat drink",
      "brand": "Example Foods",
      "image_url": null,
      "ingredients": [{ "name": "Oats", "quantity": null }],
      "nutrition": {
        "basis": "100ml",
        "energy_kcal": 46,
        "sugars_g": 3.2,
        "fat_g": 1.5,
        "saturated_fat_g": 0.2,
        "sodium_mg": null
      },
      "source": { "name": "Example product catalogue", "url": null, "retrieved_at": "2026-11-08T10:00:00Z" },
      "data_status": "partial"
    }
  ],
  "pagination": { "limit": 20, "offset": 0, "total": 1 }
}
```

### `POST /api/assessments` — future, not implemented

This endpoint is reserved for future ingredient/product assessments. It must not be called by clients until implemented and separately agreed. Request and response schema, authentication, assessment methodology, and status codes remain to be defined; no assessment result should be inferred from the product lookup endpoints.

## Error response

All error responses use this envelope. `details` is optional and should contain safe, machine-readable context (for example, a field error list); it must not expose secrets or internal stack traces.

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "No product was found for the supplied barcode.",
    "details": { "barcode": "0123456789012" }
  }
}
```

| Status | Typical code | Meaning |
| --- | --- | --- |
| `400` | `INVALID_REQUEST` | Required input is absent or malformed. |
| `404` | `PRODUCT_NOT_FOUND` | Barcode lookup found no product. |
| `405` | `METHOD_NOT_ALLOWED` | HTTP method is not supported for the route. |
| `500` | `INTERNAL_ERROR` | Unexpected server error. |
| `502` | `UPSTREAM_ERROR` | A data provider failed or returned invalid data. |
| `503` | `SERVICE_UNAVAILABLE` | Service or required dependency is unavailable. |

## CORS

For browser clients on a different origin, the API must allow the deployed frontend origin(s), including the local development origin when configured. Responses should include `Access-Control-Allow-Origin` for an allowed origin and `Vary: Origin`. Preflight `OPTIONS` responses should advertise the supported methods (`GET`, `POST`, `OPTIONS` as applicable) and headers (`Accept`, `Content-Type`, and `Authorization` only if authentication is introduced). Do not use wildcard origin together with credentials. Credentials are not required by this contract. Disallowed origins should not receive an allow-origin header.

## Environment configuration

These are proposed deployment configuration names, not claims that the current repository implements them:

| Variable | Purpose |
| --- | --- |
| `API_BASE_URL` | Base URL the frontend uses to reach the API, such as `http://localhost:8000`. If frontend code reads it in a browser build, the framework may require a public prefix (for example, `NEXT_PUBLIC_API_BASE_URL`). |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of exact allowed web origins, such as `http://localhost:3000,https://foodlens.example`. |
| `PRODUCT_DATA_PROVIDER_URL` | Optional base URL for the upstream product catalogue/provider. |
| `PRODUCT_DATA_PROVIDER_API_KEY` | Optional secret credential for that provider; server-side only and never exposed to the browser. |

The deployment owner must document which variables are required, their defaults, and secret storage once a backend/provider is selected. No credentials belong in the frontend bundle.

## Provenance and data handling

The API should return product fields as supplied by the named source, preserve ingredient order and source units, and avoid converting absent information into zero or an empty claim. `source.name` identifies the provider or dataset used; `source.url` should point to the source product record when available; `source.retrieved_at` records when the API last obtained that record. If data is combined from multiple sources, the source representation must be extended or the chosen primary source disclosed before implementation. `data_status` describes record completeness only; it is not a safety rating and does not establish that a product is safe, unsafe, authentic, or adulterated. Product screening is informational and does not replace laboratory testing or professional advice.

## Frontend developer approval needed

The routes and requested product fields are documented above. Please approve or revise these proposed interface details before clients depend on them:

1. Search response wrapper (`query`, `products`, `pagination`) and pagination names/defaults (`limit=20`, `offset=0`, `total`).
2. Meaning and allowed values of `data_status` (`complete`, `partial`, `unavailable`) and whether the complete field set is the expected completeness criterion.
3. `source` object shape (`name`, `url`, `retrieved_at`) and its nullable behavior.
4. The ingredient `quantity` unit convention. As written, it is a number in the source-declared unit, but the unit itself is not represented; quantity may need to become `{ value, unit }` if quantities are provided.
5. The exact barcode validation rules, maximum search query length, and whether the proposed `400/404/502/503` behavior matches frontend error handling.
6. CORS origin list and whether browser authentication/credentials will be needed.
7. The future assessment endpoint's request/response schema and whether assessment results will include evidence, confidence, or user-specific inputs.

Until approved, examples and proposed parameter details are guidance for discussion, not evidence of a deployed API implementation.
