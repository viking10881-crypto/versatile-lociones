/** Producto tal como lo consume la interfaz, venga de Delasoft o de los datos de ejemplo. */
export type Product = {
  id: string
  slug: string
  name: string
  family: string
  familySlug: string
  notes: string[]
  size?: string
  /** Precio final (con descuento) en la moneda del negocio; para el carrito. */
  price: number
  currency: string
  priceLabel: string
  /** Precio antes del descuento, solo si hay descuento activo. */
  compareAtLabel?: string
  hue: number
  /** Imagen principal; también es la primera de `images`. */
  image?: string
  images: string[]
  /** Descripción del admin sin la línea de notas. */
  description?: string
  badge?: string
  available: boolean
  /** Unidades máximas que se pueden agregar al carrito. */
  maxQuantity: number
}

export type Family = {
  name: string
  slug: string
  description: string
  hue: number
}

/** Banner del admin de Delasoft: su imagen ocupa el centro de la portada. */
export type Banner = {
  id: string
  title: string
  description?: string
  image: string
  buttonText?: string
  buttonLink?: string
}

export type Catalog = {
  products: Product[]
  families: Family[]
  banners: Banner[]
  /** "demo" mientras no esté configurada la clave de Delasoft. */
  source: "delasoft" | "demo"
}
