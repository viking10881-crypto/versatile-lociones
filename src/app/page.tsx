import { Bestsellers } from "@/components/site/bestsellers"
import { Collection } from "@/components/site/collection"
import { Cta } from "@/components/site/cta"
import { EmptyCatalog } from "@/components/site/empty-catalog"
import { Families } from "@/components/site/families"
import { Hero } from "@/components/site/hero"
import { Manifesto } from "@/components/site/manifesto"
import { Marquee } from "@/components/site/marquee"
import { getCatalog } from "@/lib/catalog"

// Los productos que se publiquen en el admin de Delasoft aparecen en máximo 60 s.
export const revalidate = 60

export default async function Home() {
  const { products, families } = await getCatalog()

  // Destacado: el producto disponible más reciente que tenga foto.
  const hero = products.find((p) => p.available && p.image) ?? products.find((p) => p.available) ?? products[0]
  const featured = products.slice(0, 5)
  // Con catálogos pequeños la cuadrícula repite productos en vez de quedar casi vacía.
  const grid = products.length >= 11 ? products.slice(5, 11) : products.slice(-6)
  const familiesWithProducts = families.filter((family) =>
    products.some((product) => product.familySlug === family.slug),
  )

  return (
    <>
      <main className="flex-1">
        <Hero product={hero} />
        <Marquee words={familiesWithProducts.map((family) => family.name)} />
        <Manifesto />
        {products.length > 0 ? (
          <>
            <Collection products={featured} />
            {familiesWithProducts.length > 0 ? (
              <Families families={familiesWithProducts} products={products} />
            ) : null}
            <Bestsellers products={grid} />
          </>
        ) : (
          <EmptyCatalog />
        )}
        <Cta />
      </main>
    </>
  )
}
