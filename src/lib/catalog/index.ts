import "server-only"

import { cache } from "react"
import { fetchDelasoftCatalog, isDelasoftConfigured } from "./delasoft"
import { demoCatalog } from "./demo"
import type { Catalog } from "./types"

export type { Catalog, Family, Product } from "./types"

/** Producto por slug (`nombre-id`), leído del mismo catálogo cacheado. */
export async function getProduct(slug: string) {
  const { products } = await getCatalog()
  return products.find((product) => product.slug === slug) ?? null
}

/**
 * Catálogo de la tienda. Con DELASOFT_PUBLIC_API_KEY configurada lee los productos
 * publicados desde el admin de Delasoft; sin ella usa los datos de ejemplo.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
  if (!isDelasoftConfigured()) return demoCatalog

  try {
    return await fetchDelasoftCatalog()
  } catch (error) {
    console.error("[catalog] No fue posible leer Delasoft:", error)
    // Durante el build no hay versión previa: se publica vacía (con sus estados de
    // "sin productos") para no bloquear el deploy. En una revalidación se relanza el
    // error para que Next siga sirviendo la última versión buena (p. ej. si Render
    // está despertando) y lo reintente en la siguiente.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return { products: [], families: [], source: "delasoft" }
    }
    throw error
  }
})
