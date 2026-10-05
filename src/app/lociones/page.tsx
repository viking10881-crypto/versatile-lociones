import type { Metadata } from "next"
import { Suspense } from "react"
import { SplitText } from "@/components/motion/reveal"
import { CatalogBrowser } from "@/components/site/catalog-browser"
import { EmptyCatalog } from "@/components/site/empty-catalog"
import { getCatalog } from "@/lib/catalog"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Lociones — Versatile",
  description: "Explora todas nuestras lociones y fragancias por familia olfativa.",
}

export default async function LocionesPage() {
  const { products, families } = await getCatalog()
  const familiesWithProducts = families.filter((family) =>
    products.some((product) => product.familySlug === family.slug),
  )

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-8 sm:pt-40">
        <p className="mb-4 text-xs tracking-[0.3em] text-muted-foreground uppercase">La colección</p>
        <h1 className="font-serif text-6xl leading-none font-light sm:text-8xl">
          <SplitText text="Todas las lociones" animateOnMount />
        </h1>
        <p className="mt-6 max-w-lg text-pretty text-muted-foreground">
          Encuentra tu aroma por familia olfativa y descubre cada fragancia en detalle.
        </p>
      </section>

      {products.length === 0 ? (
        <EmptyCatalog />
      ) : (
        // useSearchParams requiere Suspense para que la página siga siendo estática.
        <Suspense fallback={<div className="h-screen" />}>
          <CatalogBrowser products={products} families={familiesWithProducts} />
        </Suspense>
      )}
    </main>
  )
}
