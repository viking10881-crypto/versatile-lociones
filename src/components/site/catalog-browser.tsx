"use client"

import { useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Family, Product } from "@/lib/catalog/types"
import { ease } from "@/components/motion/reveal"
import { ProductCard } from "./product-card"

const sortOptions = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre A–Z" },
] as const

type Sort = (typeof sortOptions)[number]["value"]

function sortProducts(products: Product[], sort: Sort) {
  const list = [...products]
  if (sort === "precio-asc") list.sort((a, b) => a.price - b.price)
  if (sort === "precio-desc") list.sort((a, b) => b.price - a.price)
  if (sort === "nombre") list.sort((a, b) => a.name.localeCompare(b.name, "es"))
  // "recientes": el orden en que llegan de Delasoft (más nuevos primero).
  // Los agotados siempre al final.
  return list.sort((a, b) => Number(b.available) - Number(a.available))
}

/** Filtros y orden del catálogo; viven en la URL para poder compartir un enlace filtrado. */
export function CatalogBrowser({ products, families }: { products: Product[]; families: Family[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const family = families.some((f) => f.slug === searchParams.get("familia"))
    ? (searchParams.get("familia") as string)
    : "todas"
  const sortParam = searchParams.get("orden")
  const sort: Sort = sortOptions.some((o) => o.value === sortParam) ? (sortParam as Sort) : "recientes"

  function update(key: "familia" | "orden", value: string, defaultValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === defaultValue) params.delete(key)
    else params.set(key, value)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const visible = useMemo(() => {
    const filtered = family === "todas" ? products : products.filter((p) => p.familySlug === family)
    return sortProducts(filtered, sort)
  }, [products, family, sort])

  return (
    <>
      <div className="sticky top-0 z-30 border-y border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-8 md:flex-row md:items-center md:justify-between">
          {/* En móvil los filtros se desplazan en horizontal */}
          <div data-lenis-prevent className="-mx-4 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
            <ToggleGroup
              type="single"
              value={family}
              onValueChange={(value) => value && update("familia", value, "todas")}
              aria-label="Filtrar por familia olfativa"
              className="w-max"
            >
              {[{ slug: "todas", name: "Todas" }, ...families].map((item) => (
                <ToggleGroupItem
                  key={item.slug}
                  value={item.slug}
                  className="h-9 rounded-full border border-border px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
                >
                  {item.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex items-center justify-between gap-4 md:justify-end">
            <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              {visible.length} {visible.length === 1 ? "fragancia" : "fragancias"}
            </p>
            <Select value={sort} onValueChange={(value) => update("orden", value, "recientes")}>
              <SelectTrigger className="h-9 w-52 rounded-full" aria-label="Ordenar">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <section aria-label="Lociones" className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-8">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <SearchX className="size-10 text-muted-foreground" strokeWidth={1} />
            <p className="font-serif text-3xl">No hay lociones en esta familia</p>
            <Button variant="outline" className="rounded-full" onClick={() => update("familia", "todas", "todas")}>
              Ver todas
            </Button>
          </div>
        ) : (
          <motion.ul layout className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((product, i) => (
                <motion.li
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease, delay: Math.min(i, 8) * 0.04 }}
                >
                  <ProductCard product={product} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </section>
    </>
  )
}
