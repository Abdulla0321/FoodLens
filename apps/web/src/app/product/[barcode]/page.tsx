import { Suspense } from "react";
import ProductShell from "@/components/product-shell";
import ProductDetails from "@/components/product-details";

async function Result({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;
  return <ProductDetails key={barcode} barcode={barcode} />;
}

export default function ProductPage({ params }: { params: Promise<{ barcode: string }> }) {
  return <ProductShell><Suspense fallback={<p role="status">Loading product…</p>}><Result params={params} /></Suspense></ProductShell>;
}
