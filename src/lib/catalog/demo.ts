// Catálogo de ejemplo: se usa solo mientras no esté configurada DELASOFT_PUBLIC_API_KEY.

import { familyStyle, formatPrice, slugify } from "./format"
import type { Catalog, Family, Product } from "./types"

const raw = [
  { name: "Aurora Noir", family: "Oriental", notes: ["Ámbar", "Vainilla negra", "Oud"], size: "100 ml", price: 189000, badge: "Nuevo" },
  { name: "Jardin Blanc", family: "Floral", notes: ["Jazmín", "Peonía", "Almizcle"], size: "100 ml", price: 165000 },
  { name: "Cedro Sagrado", family: "Amaderada", notes: ["Cedro", "Vetiver", "Cuero"], size: "100 ml", price: 179000, badge: "Más vendido" },
  { name: "Brisa Amalfi", family: "Cítrica", notes: ["Bergamota", "Limón", "Neroli"], size: "75 ml", price: 139000 },
  { name: "Rosa Imperial", family: "Floral", notes: ["Rosa de Damasco", "Pimienta rosa", "Pachulí"], size: "100 ml", price: 195000, hue: 10 },
  { name: "Santal Doré", family: "Amaderada", notes: ["Sándalo", "Cardamomo", "Iris"], size: "100 ml", price: 210000, badge: "Edición limitada", hue: 75 },
  { name: "Nuit de Safran", family: "Oriental", notes: ["Azafrán", "Rosa", "Ámbar gris"], size: "100 ml", price: 225000, hue: 20 },
  { name: "Agua de Sal", family: "Cítrica", notes: ["Sal marina", "Pomelo", "Salvia"], size: "75 ml", price: 129000, hue: 210 },
]

const products: Product[] = raw.map((item) => ({
  id: slugify(item.name),
  slug: slugify(item.name),
  name: item.name,
  family: item.family,
  familySlug: slugify(item.family),
  notes: item.notes,
  size: item.size,
  price: item.price,
  currency: "COP",
  priceLabel: formatPrice(item.price),
  hue: item.hue ?? familyStyle(item.family).hue,
  images: [],
  description: `${item.name} es una fragancia ${item.family.toLowerCase()} con notas de ${item.notes.join(", ").toLowerCase()}. Datos de ejemplo mientras se conecta Delasoft.`,
  badge: item.badge,
  available: true,
  maxQuantity: 10,
}))

const families: Family[] = ["Floral", "Amaderada", "Cítrica", "Oriental"].map((name) => ({
  name,
  slug: slugify(name),
  ...familyStyle(name),
}))

export const demoCatalog: Catalog = { products, families, banners: [], source: "demo" }
