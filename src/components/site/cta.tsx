"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Reveal, SplitText } from "@/components/motion/reveal"
import { BottleArt } from "./product-visual"

/** Bloque oscuro que se expande desde una ventana central conforme entra en pantalla. */
export function Cta() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] })
  const inset = useTransform(scrollYProgress, [0, 1], [12, 0])
  const radius = useTransform(scrollYProgress, [0, 1], [32, 0])
  const clipPath = useTransform(
    [inset, radius],
    ([i, r]) => `inset(${i}% ${i}% 0% ${i}% round ${r}px)`,
  )
  const bottleY = useTransform(scrollYProgress, [0, 1], ["30%", "0%"])

  return (
    <section ref={ref} className="relative">
      <motion.div
        style={{ clipPath }}
        className="dark relative overflow-hidden bg-[oklch(0.17_0.01_60)] text-foreground"
      >
        <div aria-hidden className="absolute -top-1/3 left-1/2 size-[130vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.6_0.1_70/0.3),transparent)]" />
        <div className="relative mx-auto grid min-h-svh max-w-7xl items-center gap-12 px-4 py-24 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-6 text-xs tracking-[0.3em] text-muted-foreground uppercase">Club Versatille</p>
            <h2 className="font-serif text-5xl leading-[1.05] font-light text-balance sm:text-7xl">
              <SplitText text="Recibe muestras antes que nadie" />
            </h2>
            <Reveal delay={0.3}>
              <p className="mt-6 max-w-md text-pretty text-muted-foreground">
                Suscríbete y obtén 10% en tu primera compra, acceso anticipado a lanzamientos y
                muestras de temporada.
              </p>
              <form
                className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(event) => event.preventDefault()}
              >
                <label htmlFor="cta-email" className="sr-only">
                  Correo electrónico
                </label>
                <Input
                  id="cta-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  className="h-12 rounded-full px-5"
                />
                <Button type="submit" size="lg" className="h-12 rounded-full px-6">
                  Suscribirme <ArrowRight data-icon="inline-end" />
                </Button>
              </form>
            </Reveal>
          </div>
          <motion.div style={{ y: bottleY }} className="relative mx-auto h-[56svh] w-[34svh] max-w-full will-change-transform">
            <div aria-hidden className="absolute inset-[-25%] bg-[radial-gradient(closest-side,oklch(0.6_0.1_70/0.3),transparent)]" />
            <BottleArt hue={60} className="relative h-full w-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
