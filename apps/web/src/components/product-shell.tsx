import Link from "next/link";
import { isMockMode } from "@/lib/api";

export default function ProductShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200 bg-white"><nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5" aria-label="Main navigation"><Link href="/" className="text-2xl font-bold text-emerald-700">FoodLens</Link><Link href="/scan" className="font-medium text-emerald-700 underline underline-offset-4">Scan Product</Link></nav></header>
    <div className="mx-auto max-w-4xl px-6 py-10"><p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{isMockMode ? "Mock mode · Fictional sample products and label data. " : "Connected API mode · "}Product identification does not assess food safety or adulteration.</p>{children}</div>
  </main>;
}
