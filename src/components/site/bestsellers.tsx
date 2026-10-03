"use client"

import { motion } from "motion/react"
import { SplitText, ease } from "@/components/motion/reveal"
import type { Product } from "@/lib/catalog/types"
import { ProductCard } from "./product-card"

export function Bestsellers({ products }: { products: Product[] }) {
  return (
    <section id="mas-vendidos" className="mx-auto max-w-7xl px-4 pt-8 pb-32 sm:px-8 sm:pb-48">
      <div className="mb-14 flex items-end justify-between gap-6">
        <div>
          <p className="mb-4 text-xs tracking-[0.3em] text-muted-foreground uppercase">Favoritos</p>
          <h2 className="font-serif text-5xl leading-none font-light sm:text-7xl">
            <SplitText text="Los más deseados" />
          </h2>
        </div>
      </div>

      <motion.div
        className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ staggerChildren: 0.08 }}
      >
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            className={i % 3 === 1 ? "lg:translate-y-16" : undefined}
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
            }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
