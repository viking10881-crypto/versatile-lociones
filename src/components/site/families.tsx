"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Reveal, SplitText, ease } from "@/components/motion/reveal"
import type { Family, Product } from "@/lib/catalog/types"
import { ProductVisual } from "./product-visual"

/** Lista editorial: al pasar el cursor, una vista previa del frasco lo sigue con inercia. */
export function Families({ families, products }: { families: Family[]; products: Product[] }) {
  const [active, setActive] = useState<number | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.4 })

  function handleMove(event: React.PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left)
    y.set(event.clientY - rect.top)
  }

  const preview = active === null ? null : products.find((p) => p.familySlug === families[active].slug)

  return (
    <section id="familias" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
      <div className="mb-16 grid gap-6 md:grid-cols-2 md:items-end">
        <h2 className="font-serif text-5xl leading-none font-light sm:text-7xl">
          <SplitText text="Encuentra tu familia olfativa" />
        </h2>
        <Reveal delay={0.2}>
          <p className="max-w-md text-pretty text-muted-foreground md:ml-auto">
            Cada familia agrupa aromas con un carácter común. Empieza por la que más se parece a ti y
            descubre sus matices.
          </p>
        </Reveal>
      </div>

      <div
        className="relative"
        onPointerMove={handleMove}
        onPointerLeave={() => setActive(null)}
      >
        <ul className="border-t border-border">
          {families.map((family, i) => (
            <li key={family.name} className="border-b border-border">
              <Reveal delay={i * 0.05} y={20}>
                <Link
                  href={`/lociones?familia=${family.slug}`}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="group flex items-center justify-between gap-6 py-8 transition-colors sm:py-10"
                >
                  <span className="flex items-baseline gap-6">
                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-serif text-4xl font-light transition-[transform,font-style] duration-300 ease-out group-hover:translate-x-4 group-hover:italic sm:text-6xl lg:text-7xl">
                      {family.name}
                    </span>
                  </span>
                  <span className="flex items-center gap-6">
                    <span className="hidden max-w-56 text-right text-sm text-muted-foreground md:block">
                      {family.description}
                    </span>
                    <span className="grid size-12 shrink-0 place-items-center rounded-full border border-border transition-colors duration-500 group-hover:bg-foreground group-hover:text-background">
                      <ArrowRight className="size-4 transition-transform duration-500 group-hover:-rotate-45" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* Vista previa flotante (solo con ratón) */}
        <motion.div
          aria-hidden
          style={{ x: springX, y: springY }}
          className="pointer-events-none absolute top-0 left-0 z-10 hidden will-change-transform lg:block"
        >
          <AnimatePresence>
            {preview && active !== null ? (
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 8 }}
                transition={{ duration: 0.3, ease }}
                className="-translate-1/2 absolute h-80 w-60 overflow-hidden rounded-lg p-8 shadow-2xl"
                style={{
                  background: `linear-gradient(160deg, oklch(0.96 0.02 85), oklch(0.84 0.07 ${families[active].hue}))`,
                }}
              >
                <div className="relative h-full w-full">
                  <ProductVisual product={preview} sizes="240px" />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
