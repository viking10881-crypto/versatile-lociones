/** Producto tal como lo consume la interfaz, venga de Delasoft o de los datos de ejemplo. */
export type Product = {
  id: string
  slug: string
  name: string
  family: string
  familySlug: string
  notes: string[]
  size?: string
  priceLabel: string
  /** Precio antes del descuento, solo si hay descuento activo. */
  compareAtLabel?: string
  hue: number
  image?: string
  badge?: string
  available: boolean
}

export type Family = {
  name: string
  slug: string
  description: string
  hue: number
}

export type Catalog = {
  products: Product[]
  families: Family[]
  /** "demo" mientras no esté configurada la clave de Delasoft. */
  source: "delasoft" | "demo"
}
