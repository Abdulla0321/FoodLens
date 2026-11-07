"use client";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useState } from "react";
import { normalizeBarcode, productService, ApiRequestError, type Product } from "@/lib/products";

export default function ProductDetails({ barcode }: { barcode: string }) {

  const [state, setState] = useState<{ barcode: string; product?: Product | null; error?: string }>({ barcode: "" });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const normalized = normalizeBarcode(barcode);
    if (!normalized) return;
    productService.getByBarcode(normalized, controller.signal).then((product) => { if (active) setState({ barcode, product }); }).catch((error: unknown) => { if (active) setState({ barcode, error: error instanceof ApiRequestError ? error.message : "Product details could not be loaded. Please try again." }); });
    return () => { active = false; controller.abort(); };
  }, [barcode, retry]);

  const back = <Link href="/scan" className="mb-6 inline-block font-medium text-emerald-700 underline underline-offset-4">← Scan or search again</Link>;
  if (!normalizeBarcode(barcode)) return <>{back}<h1 className="text-2xl font-bold">Invalid or missing barcode</h1><p className="mt-3">Use the scan page to enter an 8, 12, 13, or 14 digit barcode.</p></>;
  if (state.barcode !== barcode || (!state.error && state.product === undefined)) return <>{back}<p role="status">Loading product…</p></>;
  if (state.error) return <>{back}<p role="alert">{state.error}</p><button onClick={() => { setState({ barcode: "" }); setRetry(retry + 1); }} className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 text-white">Try again</button></>;
  const product = state.product;
  if (!product) return <>{back}<h1 className="text-2xl font-bold">Product not found</h1><p className="mt-3 break-words">No product matches barcode {barcode}. Try 8901234567890 or search by name.</p></>;
  return <>{back}<article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8"><div className="grid gap-8 sm:grid-cols-[180px_1fr]"><div className="flex min-h-48 items-center justify-center rounded-xl bg-slate-100">{product.image ? <Image unoptimized src={product.image} alt={`${product.name} product packaging`} width={180} height={220} /> : <span className="p-5 text-center text-sm text-slate-500">Product image unavailable</span>}</div><div><p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{product.source === "mock" ? "Mock product · fictional sample" : "Product information"}</p><h1 className="mt-2 text-3xl font-bold">{product.name}</h1><p className="mt-3 text-lg text-slate-600">Brand: {product.brand}</p><p className="mt-2 break-all text-sm text-slate-500">Barcode: {product.barcode}</p></div></div><section className="mt-8"><h2 className="text-xl font-semibold">Ingredients</h2><p className="mt-3 leading-7 text-slate-600">{product.ingredients?.map((ingredient) => ingredient.name).join(", ") || "Ingredient information is unavailable for this product."}</p></section><section className="mt-8"><h2 className="text-xl font-semibold">Available nutrition information</h2>{product.nutrition.nutrients.length ? <><p className="mt-2 text-sm text-slate-500">{product.nutrition.basis}</p><dl className="mt-4 divide-y divide-slate-200">{product.nutrition.nutrients.map((item) => <div key={item.label} className="flex justify-between gap-4 py-3"><dt>{item.label}</dt><dd className="font-medium">{item.value}</dd></div>)}</dl><p className="mt-3 text-sm text-slate-500">Only available fields are shown. Missing values are not zero.</p></> : <p className="mt-3 text-slate-600">Nutrition information is unavailable for this product.</p>}</section></article></>;
}

