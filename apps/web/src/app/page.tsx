
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!search.trim()) return;

    router.push(`/scan?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold text-emerald-700"
          >
            FoodLens
          </Link>

          <Link href="/scan" className="text-sm font-semibold text-emerald-700">Scan Product</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mb-6 inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
          Smarter food choices begin here
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
          Know what&apos;s
          <span className="text-emerald-600">
            {" "}in your food.
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-slate-600">
          Scan packaged food products, investigate ingredients,
          identify potential adulteration concerns, and receive
          evidence-based food safety assessments.
        </p>

        {/* Main Actions */}
        <div className="mx-auto mb-12 grid max-w-xl gap-4 sm:grid-cols-2">
          <Link
            href="/scan"
            className="rounded-xl bg-emerald-600 px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Scan Product
          </Link>

          <Link
            href="/ingredients"
            className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-semibold transition hover:bg-slate-100"
          >
            Ingredient Analysis
          </Link>
        </div>

        {/* Manual Search */}
        <form
          onSubmit={handleSearch}
          className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products manually..."
            aria-label="Search products"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-5 py-4 outline-none focus:border-emerald-600"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-8 py-4 font-semibold text-white hover:bg-slate-800"
          >
            Search
          </button>
        </form>
      </section>

      {/* Features Section */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-3xl font-bold">
            What FoodLens Investigates
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Adulteration Indicators",
                description:
                  "Investigate potential adulteration, contamination reports, and inconsistencies in product information.",
              },
              {
                title: "Ingredient Intelligence",
                description:
                  "Identify questionable additives and ordinary ingredients present in potentially excessive quantities.",
              },
              {
                title: "Personalised Assessment",
                description:
                  "Understand ingredient concerns relevant to your allergies, dietary restrictions, and declared health profile.",
              },
            ].map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 p-7 shadow-sm"
              >
                <h3 className="mb-3 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
        <p>FoodLens — Food Safety Intelligence</p>
        <p className="mt-2">
          Screening information does not replace laboratory
          testing or professional medical advice.
        </p>
      </footer>
    </main>
  );
}

