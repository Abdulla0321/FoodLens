import { Suspense } from "react";
import ProductShell from "@/components/product-shell";
import LegacyProduct from "@/components/legacy-product";

export default function ProductPage() {
  return <ProductShell><Suspense fallback={<p>Loading product…</p>}><LegacyProduct /></Suspense></ProductShell>;
}
