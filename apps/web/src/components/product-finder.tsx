"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BarcodeScanner from "./barcode-scanner";
import { normalizeBarcode, productService, isMockMode, type Product } from "@/lib/products";

export default function ProductFinder() {
  const router = useRouter();
  const params = useSearchParams();
  const [barcode, setBarcode] = useState("");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [results, setResults] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef(0);
  const initialQuery = params.get("q")?.trim() ?? "";

  useEffect(() => {
    if (!initialQuery) return;
    const id = ++request.current;
    productService.searchByName(initialQuery).then((products) => {
      if (id === request.current) setResults(products);
    }).catch(() => {
      if (id === request.current) setError("Product search is unavailable. Please try again.");
    });
    return () => { request.current += 1; };
  }, [initialQuery]);

  function identify(value: string) {
    const normalized = normalizeBarcode(value);
    if (!normalized) { setError("Enter a numeric barcode with 8, 12, 13, or 14 digits."); return; }
    request.current += 1;
    router.push(`/product/${encodeURIComponent(normalized)}`);
  }

  async function search(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (!term) { setError("Enter a product name or brand to search."); return; }
    const id = ++request.current;
    setError(""); setBusy(true); setResults(null);
    try { const products = await productService.searchByName(term); if (id === request.current) setResults(products); }
    catch { if (id === request.current) setError("Product search is unavailable. Please try again."); }
    finally { if (id === request.current) setBusy(false); }
  }

  return <div className="space-y-6"><BarcodeScanner onDetected={identify} />
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Enter a barcode</h2><form onSubmit={(event) => { event.preventDefault(); identify(barcode); }} className="mt-4 flex flex-col gap-3 sm:flex-row"><div className="min-w-0 flex-1"><label htmlFor="barcode" className="mb-2 block text-sm font-medium">Product barcode</label><input id="barcode" value={barcode} onChange={(event) => setBarcode(event.target.value)} inputMode="numeric" autoComplete="off" placeholder="8901234567890" className="w-full rounded-xl border border-slate-300 px-4 py-3" /></div><button className="self-end rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white max-sm:w-full">Find product</button></form><p className="mt-3 text-sm text-slate-500">Try sample barcode: 8901234567890 (oats).</p></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Search by name</h2><form onSubmit={search} className="mt-4 flex flex-col gap-3 sm:flex-row"><div className="min-w-0 flex-1"><label htmlFor="product-name" className="mb-2 block text-sm font-medium">Product name or brand</label><input id="product-name" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try oats, peanut, or soup" className="w-full rounded-xl border border-slate-300 px-4 py-3" /></div><button disabled={busy} className="self-end rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50 max-sm:w-full">{busy ? "Searching…" : "Search"}</button></form>
    <div aria-live="polite">{results && <><p className="mt-5 text-sm text-slate-600">{results.length ? `${results.length} ${isMockMode ? "mock " : ""}product(s) found` : (isMockMode ? "No matching sample products. Try oats, peanut, or soup." : "No matching products. Try a different name or brand.")}</p><ul className="mt-3 space-y-3">{results.map((product) => <li key={product.barcode}><Link href={`/product/${encodeURIComponent(product.barcode)}`} className="block rounded-xl border border-slate-200 p-4 hover:border-emerald-600"><span className="font-semibold text-emerald-800">{product.name} →</span><span className="mt-1 block text-sm text-slate-600">{product.brand} · {product.barcode}</span></Link></li>)}</ul></>}</div></section>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
  </div>;
}

