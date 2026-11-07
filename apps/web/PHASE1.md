# Phase 1 product identification

Run `npm install` and `npm run dev` from this directory, then open http://localhost:3000.

## Manual checks

- Homepage: existing layout remains; Scan Product opens `/scan`. Search for `oats` on the homepage to see a matching sample result.
- Camera: on `/scan`, Start camera and allow access. Show a supported retail barcode to open its details (unknown barcodes show Product not found). Stop camera, navigate away, or hide the tab to release the camera. Returning requires Start camera again.
- Permissions: deny camera permission and check the explanatory message; change site permission in browser settings and retry. Try a device without a camera. On mobile, use an HTTPS development URL; a plain HTTP LAN address cannot access the camera. Manual search works without camera access.
- Barcode fallback: enter `8901234567890` for oats, `8901234567906` for peanut butter, or `8901234567913` for soup. Spaces/hyphens are stripped. Empty, alphabetic, and unsupported length inputs show validation. `12345678` shows not found.
- Name fallback: search `oats`, `peanut`, `soup`, or `demo`; select a result. Search `unknown` for the empty state; submit whitespace for validation.
- Details: oats has a sample image, ingredients and nutrition; peanut butter has partial nutrition; soup demonstrates missing image, ingredients and nutrition. Open `/product` for missing-barcode handling. Reload a product URL and use the back-to-search link.
- Mobile: check at 375px width, portrait and landscape, and use keyboard navigation. Forms stack; long barcodes wrap; status and errors use live announcements.

## Service boundary

The shared Product, Ingredient, Nutrition and ApiError interfaces are in `src/types/api.ts`. The central asynchronous service is in `src/lib/api.ts`; fictional fixtures live separately in `src/data/mock-products.ts`. `src/lib/products.ts` preserves imports and barcode normalization. No safety assessments are made.

Leave `NEXT_PUBLIC_API_BASE_URL` empty for mock mode. Set it in `.env.local` to enable the HTTP adapter, then restart/rebuild. See [API_CONTRACT.md](../../docs/API_CONTRACT.md) for the draft response schema, errors and CORS requirements. API failures never silently fall back to fixtures. This phase does not change backend code.

New results URLs are `/product/8901234567890` (oats), `/product/8901234567913` (missing information), and `/product/12345678` (missing product). Legacy `/product?barcode=...` links remain functional. Test API errors by configuring an unreachable API base URL, restarting and opening a result; the error state offers Try again. Clear the variable and restart to return to mock mode.

## Checks

Run `npm run lint` and `npm run build`. Physical camera decoding and permission behavior require manual checks on the target mobile browser; CI/build checks cannot validate camera hardware.
