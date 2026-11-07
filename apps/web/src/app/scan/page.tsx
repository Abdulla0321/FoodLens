import { Suspense } from "react";
import ProductShell from "@/components/product-shell";
import ProductFinder from "@/components/product-finder";

export default function ScanPage() {
  return <ProductShell><h1 className="text-3xl font-bold">Identify a product</h1><p className="mb-8 mt-3 text-slate-600">Scan, enter a barcode, or search by product name.</p><Suspense fallback={<p>Loading product search…</p>}><ProductFinder /></Suspense></ProductShell>;
}
