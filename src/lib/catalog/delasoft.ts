import "server-only"

import { familyStyle, formatPrice, slugify, titleCase } from "./format"
import type { Catalog, Family, Product } from "./types"

// Contrato de la API pública de Delasoft (delasoft_back/routes/public-api.routes.js).

type ApiImage = { url: string; is_main: boolean }

type ApiSwatch = { attribute_slug: string; value: string; display_value: string }

type ApiProduct = {
  id: number | string
  name: string
  sku: string | null
  description: string | null
  sale_price: string | number
  final_price: string | number | null
  discount_type: "percentage" | "fixed" | null
  discount_value: string | number | null
  stock: number
  stock_status: "normal" | "low" | "out"
  fulfillment_mode: "stock" | "on_demand" | "hybrid" | null
  category_name: string | null
  category_slug: string | null
  main_image: string | null
  images: ApiImage[]
  variant_swatches?: ApiSwatch[]
}

type ApiCategory = {
  name: string
  slug: string
  description: string | null
  children?: ApiCategory[]
}

type ApiProfile = { currency: string | null } | null

type ApiResponse<T> = { success: boolean; data: T; message?: string }

/** Segundos que una página puede servirse antes de volver a consultar Delasoft. */
export const REVALIDATE_SECONDS = 60

export function isDelasoftConfigured() {
  return Boolean(process.env.DELASOFT_PUBLIC_API_KEY)
}

async function delasoftFetch<T>(path: string): Promise<T> {
  const base = (
    process.env.DELASOFT_PUBLIC_API_URL || "https://delasoft-back.onrender.com/public-api/v1"
  ).replace(/\/$/, "")

  const res = await fetch(`${base}${path}`, {
    headers: {
      "X-API-Key": process.env.DELASOFT_PUBLIC_API_KEY ?? "",
      // Delasoft valida la clave contra sus "orígenes permitidos". Desde el servidor no
      // hay Origin automático, así que se envía el dominio registrado para la clave.
      ...(process.env.DELASOFT_STORE_ORIGIN ? { Origin: process.env.DELASOFT_STORE_ORIGIN } : {}),
    },
    next: { revalidate: REVALIDATE_SECONDS, tags: ["delasoft"] },
    signal: AbortSignal.timeout(30_000), // Render puede tardar en despertar
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Delasoft ${path} respondió ${res.status}: ${body.slice(0, 200)}`)
  }

  const payload = (await res.json()) as ApiResponse<T>
  return payload.data
}

// En la descripción del admin, una línea "Notas: Ámbar, Vainilla, Oud" alimenta las notas.
const NOTES_LINE = /^\s*notas?(?:\s+olfativas)?\s*:\s*(.+)$/im
const SIZE_IN_TEXT = /(\d+(?:[.,]\d+)?\s?ml)\b/i
const SIZE_ATTRIBUTE = /tama|size|ml|volumen|presentaci|capacidad/i

function parseNotes(description: string | null) {
  const match = description?.match(NOTES_LINE)
  if (!match) return []
  return match[1]
    .split(/[,·/|]| y /)
    .map((note) => note.trim())
    .filter(Boolean)
    .slice(0, 4)
}

function parseSize(product: ApiProduct) {
  const swatch = product.variant_swatches?.find((s) => SIZE_ATTRIBUTE.test(s.attribute_slug))
  if (swatch) return swatch.display_value
  const match = product.name.match(SIZE_IN_TEXT) ?? product.description?.match(SIZE_IN_TEXT)
  // "90Ml", "90 ML", "90ml" → "90 ml"
  return match ? `${match[1].replace(/\s?ml$/i, "").replace(",", ".")} ml` : undefined
}

function badgeFor(product: ApiProduct) {
  if (product.stock_status === "out") return "Agotado"
  if (product.discount_type === "percentage" && product.discount_value) {
    return `-${Number(product.discount_value)}%`
  }
  if (product.discount_type) return "Oferta"
  if (product.stock_status === "low") return "Últimas unidades"
  return undefined
}

/** Todas las fotos del producto, con la principal primero y sin repetidas. */
function productImages(product: ApiProduct) {
  const ordered = [
    product.main_image,
    ...product.images.filter((image) => image.is_main).map((image) => image.url),
    ...product.images.map((image) => image.url),
  ]
  return [...new Set(ordered.filter((url): url is string => Boolean(url)))]
}

function cleanDescription(description: string | null) {
  const text = description?.replace(NOTES_LINE, "").trim()
  return text || undefined
}

// Sobre pedido no hay tope de stock; se limita para evitar pedidos accidentales.
const MAX_PER_ORDER = 10

function maxQuantity(product: ApiProduct) {
  if (product.stock_status === "out") return 0
  if (product.fulfillment_mode === "on_demand" || product.fulfillment_mode === "hybrid") return MAX_PER_ORDER
  return Math.max(1, Math.min(product.stock, MAX_PER_ORDER))
}

function toProduct(product: ApiProduct, currency: string): Product {
  const family = titleCase(product.category_name ?? "Colección")
  const basePrice = Number(product.sale_price)
  const finalPrice = Number(product.final_price ?? product.sale_price)
  const discounted = finalPrice < basePrice
  const images = productImages(product)

  return {
    id: String(product.id),
    slug: `${slugify(product.name)}-${product.id}`,
    name: product.name,
    family,
    // Se deriva del nombre: el slug que guarda el admin puede ser poco legible (p. ej. "l").
    familySlug: slugify(family),
    notes: parseNotes(product.description),
    size: parseSize(product),
    price: finalPrice,
    currency,
    priceLabel: formatPrice(finalPrice, currency),
    compareAtLabel: discounted ? formatPrice(basePrice, currency) : undefined,
    hue: familyStyle(family).hue,
    image: images[0],
    images,
    description: cleanDescription(product.description),
    badge: badgeFor(product),
    available: product.stock_status !== "out",
    maxQuantity: maxQuantity(product),
  }
}

/** Familias = categorías que tienen productos publicados, con la descripción del admin si existe. */
function toFamilies(products: Product[], categories: ApiCategory[] | null): Family[] {
  const descriptions = new Map<string, string>()
  const collect = (items: ApiCategory[]) => {
    for (const category of items) {
      if (category.description) descriptions.set(slugify(category.name), category.description)
      collect(category.children ?? [])
    }
  }
  collect(categories ?? [])

  const families = new Map<string, Family>()
  for (const product of products) {
    if (families.has(product.familySlug)) continue
    const style = familyStyle(product.family)
    families.set(product.familySlug, {
      name: product.family,
      slug: product.familySlug,
      hue: style.hue,
      description: descriptions.get(product.familySlug) ?? style.description,
    })
  }
  return [...families.values()]
}

export async function fetchDelasoftCatalog(): Promise<Catalog> {
  const [apiProducts, categories, profile] = await Promise.all([
    delasoftFetch<ApiProduct[]>("/products?limit=100&sort=newest"),
    // Solo aporta descripciones y requiere el permiso "categories:read"; es opcional.
    delasoftFetch<ApiCategory[]>("/categories").catch(() => null),
    delasoftFetch<ApiProfile>("/profile").catch(() => null),
  ])
  const currency = profile?.currency || "COP"
  const products = apiProducts.map((product) => toProduct(product, currency))

  return {
    products,
    families: toFamilies(products, categories),
    source: "delasoft",
  }
}
