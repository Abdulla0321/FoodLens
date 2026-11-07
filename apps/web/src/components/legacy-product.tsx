"use client";
import { useSearchParams } from "next/navigation";
import ProductDetails from "./product-details";

export default function LegacyProduct() {
  const barcode = useSearchParams().get("barcode") ?? "";
  return <ProductDetails key={barcode} barcode={barcode} />;
}
