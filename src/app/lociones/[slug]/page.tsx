import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Reveal } from "@/components/motion/reveal"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/site/product-card"
import { ProductGallery } from "@/components/site/product-gallery"
import { ProductPurchase } from "@/components/site/product-purchase"
import { getCatalog, getProduct } from "@/lib/catalog"

export const revalidate = 60

// Se prerenderizan los productos actuales; los que se publiquen después se generan
// en la primera visita y quedan cacheados.
export async function generateStaticParams() {
  const { products } = await getCatalog()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: PageProps<"/lociones/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: "Loción no encontrada — Versatile" }
  const description =
    product.description?.slice(0, 155) ?? `${product.name}, fragancia ${product.family.toLowerCase()}.`
  return {
    title: `${product.name} — Versatile`,
    description,
    openGraph: { title: product.name, description, images: product.images.slice(0, 1) },
  }
}

export default async function ProductPage({ params }: PageProps<"/lociones/[slug]">) {
  const { slug } = await params
  const [product, { products }] = await Promise.all([getProduct(slug), getCatalog()])
  if (!product) notFound()

  // Relacionadas: primero de la misma familia, luego el resto.
  const others = products.filter((p) => p.id !== product.id)
  const related = [
    ...others.filter((p) => p.familySlug === product.familySlug),
    ...others.filter((p) => p.familySlug !== product.familySlug),
  ].slice(0, 3)

  const paragraphs = product.description?.split(/\n+/).filter(Boolean) ?? []

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    category: product.family,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  }

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-8 sm:pt-32">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/lociones">Lociones</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery product={product} />
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-8">
            <div>
              <Link
                href={`/lociones?familia=${product.familySlug}`}
                className="text-xs tracking-[0.3em] text-muted-foreground uppercase hover:text-foreground"
              >
                {product.family}
              </Link>
              <h1 className="mt-3 font-serif text-4xl leading-[1.05] font-light text-balance sm:text-5xl">
                {product.name}
              </h1>
              <div className="mt-5 flex items-baseline gap-3">
                <p className="text-2xl font-medium tabular-nums">{product.priceLabel}</p>
                {product.compareAtLabel ? (
                  <p className="text-muted-foreground tabular-nums line-through">{product.compareAtLabel}</p>
                ) : null}
              </div>
              {product.size ? <p className="mt-1 text-sm text-muted-foreground">{product.size}</p> : null}
            </div>

            {product.notes.length > 0 ? (
              <div>
                <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Notas olfativas</p>
                <ul className="flex flex-wrap gap-2">
                  {product.notes.map((note) => (
                    <li key={note} className="rounded-full border border-border px-4 py-1.5 text-sm">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <ProductPurchase product={product} />

            {paragraphs.length > 0 ? (
              <>
                <Separator />
                <div>
                  <h2 className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Descripción</h2>
                  <div className="space-y-4 text-pretty leading-relaxed text-foreground/85">
                    {paragraphs.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <Separator />
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Familia</dt>
              <dd>{product.family}</dd>
              {product.size ? (
                <>
                  <dt className="text-muted-foreground">Presentación</dt>
                  <dd>{product.size}</dd>
                </>
              ) : null}
            </dl>
          </Reveal>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-32 sm:px-8">
          <h2 className="mb-12 font-serif text-4xl font-light sm:text-5xl">También te puede gustar</h2>
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="pb-32" />
      )}
    </main>
  )
}
