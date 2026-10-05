"use client"

import { useRef } from "react"
import Link from "next/link"
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import { ArrowDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SplitText, ease } from "@/components/motion/reveal"
import Image from "next/image"
import type { Banner, Product } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"
import { BottleArt, ProductVisual } from "./product-visual"

const notePositions = [
  { className: "left-[8%] top-[28%]", speed: -160 },
  { className: "right-[9%] top-[22%]", speed: -260 },
  { className: "left-[16%] bottom-[24%]", speed: -90 },
  { className: "right-[12%] bottom-[30%]", speed: -200 },
]

/** Las etiquetas flotantes muestran las notas del producto destacado y su tamaño. */
function heroNotes(product?: Product) {
  const labels = product ? [...product.notes.slice(0, 3), product.size ?? product.family] : []
  return labels.slice(0, notePositions.length).map((label, i) => ({ label, ...notePositions[i] }))
}

export function Hero({ product, banner }: { product?: Product; banner?: Banner }) {
  // Con banner, la imagen del admin (p. ej. el logo) ocupa el centro y no hay notas del producto.
  const floatingNotes = banner ? [] : heroNotes(product)

  const ref = useRef<HTMLElement>(null)
  // Sin resorte extra: Lenis ya suaviza el scroll, así la escena responde al instante.
  const { scrollYProgress: progress } = useScroll({ target: ref, offset: ["start start", "end end"] })

  // Escena 1 → 2: el titular se abre y desvanece, el frasco gira y sube, aparece la frase.
  const titleScale = useTransform(progress, [0, 0.5], [1, 1.3])
  const titleOpacity = useTransform(progress, [0.15, 0.5], [1, 0])
  const bottleY = useTransform(progress, [0, 1], ["0%", "-18%"])
  const bottleRotate = useTransform(progress, [0, 1], [0, -12])
  const bottleScale = useTransform(progress, [0, 0.6, 1], [1, 0.82, 0.7])
  const introOpacity = useTransform(progress, [0, 0.2], [1, 0])
  const introY = useTransform(progress, [0, 0.2], [0, 40])
  const quoteOpacity = useTransform(progress, [0.5, 0.75], [0, 1])
  const quoteY = useTransform(progress, [0.5, 0.75], [60, 0])
  const glowScale = useTransform(progress, [0, 1], [1, 1.6])

  // Inclinación sutil del frasco siguiendo el cursor.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [8, -8]), { stiffness: 160, damping: 22 })
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), { stiffness: 160, damping: 22 })

  function handlePointerMove(event: React.PointerEvent) {
    if (event.pointerType !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <section ref={ref} className="relative h-[220vh]" aria-label="Presentación">
      <div
        className="sticky top-0 flex h-svh items-center justify-center overflow-hidden"
        onPointerMove={handlePointerMove}
      >
        {/* Fondo: halos cálidos que se expanden al avanzar */}
        {/* Degradados radiales en lugar de blur(): se pintan una vez y solo se escalan en GPU */}
        <motion.div
          aria-hidden
          style={{ scale: glowScale }}
          className="pointer-events-none absolute inset-0 will-change-transform"
        >
          <div className="absolute top-1/2 left-1/2 size-[110vmin] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.85_0.08_75/0.55),transparent)]" />
          <div className="absolute top-[5%] left-[2%] size-[60vmin] rounded-full bg-[radial-gradient(closest-side,oklch(0.88_0.06_20/0.45),transparent)]" />
          <div className="absolute right-0 bottom-0 size-[65vmin] rounded-full bg-[radial-gradient(closest-side,oklch(0.9_0.05_95/0.45),transparent)]" />
        </motion.div>

        {/* Titular gigante detrás del frasco */}
        <motion.h1
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="pointer-events-none absolute will-change-transform inset-x-0 top-1/2 -translate-y-1/2 text-center font-serif text-[16.5vw] leading-none font-light whitespace-nowrap uppercase select-none lg:text-[16vw]"
        >
          <SplitText text="Versatile" by="chars" stagger={0.035} delay={0.1} duration={0.8} animateOnMount />
        </motion.h1>

        {/* Notas flotantes con parallax a distintas velocidades */}
        {floatingNotes.map((note, i) => (
          <FloatingNote key={note.label} index={i} progress={progress} {...note} />
        ))}

        {/* Frasco */}
        <motion.div
          style={{ y: bottleY, rotate: bottleRotate, scale: bottleScale }}
          className={cn(
            "relative z-10 -mt-[12svh] will-change-transform perspective-[1000px] md:mt-0",
            banner
              ? "h-[42svh] w-[42svh] max-w-[86vw] md:h-[58svh] md:w-[58svh]"
              : "h-[40svh] w-[25svh] md:h-[52svh] md:w-[33svh]",
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.25 }}
            style={{ rotateX: tiltX, rotateY: tiltY }}
            className="relative h-full w-full transform-3d"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-full w-full"
            >
              {/* Halo del color de fondo: el titular gigante se desvanece detrás del logo */}
              {banner ? (
                <div
                  aria-hidden
                  className="absolute inset-[16%] rounded-full bg-[radial-gradient(closest-side,var(--background)_55%,transparent)] md:inset-[-6%]"
                />
              ) : null}
              {banner ? (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  priority
                  sizes="(min-width: 768px) 58vh, 86vw"
                  // multiply funde el fondo blanco de la imagen con el degradado de la portada
                  className="object-contain mix-blend-multiply"
                />
              ) : null}
              {/* Sombra estática con degradado: evita recalcular drop-shadow() en cada fotograma */}
              {banner ? null : (
                <div aria-hidden className="absolute inset-x-[-20%] bottom-[-8%] h-[24%] rounded-[50%] bg-[radial-gradient(closest-side,oklch(0.3_0.05_60/0.28),transparent)]" />
              )}
              {banner ? null : product ? (
                <ProductVisual product={product} priority sizes="40vh" />
              ) : (
                <BottleArt hue={60} className="relative h-full w-full" />
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Introducción inferior */}
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-8 sm:px-8 md:flex-row md:items-end md:justify-between md:pb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.5 }}
            className="max-w-sm"
          >
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
              {banner?.title ?? "Colección 2026"}
            </p>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
              {banner?.description ??
                "Lociones de autor que evolucionan contigo: de la frescura de la mañana a la intensidad de la noche."}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.6 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link href={banner?.buttonLink ?? "/lociones"}>
                {banner?.buttonText ?? "Descubrir colección"} <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full bg-transparent px-6">
              <a href="#familias">Encuentra tu aroma</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Frase que aparece en la segunda mitad del scroll */}
        <motion.p
          style={{ opacity: quoteOpacity, y: quoteY }}
          className="absolute inset-x-4 bottom-[12svh] z-20 mx-auto max-w-3xl text-center font-serif text-4xl leading-tight text-balance italic sm:text-5xl lg:text-6xl"
        >
          Una fragancia para cada versión de ti.
        </motion.p>

        <motion.div
          style={{ opacity: introOpacity }}
          className="absolute right-4 bottom-1/3 z-20 hidden flex-col items-center gap-3 text-xs tracking-[0.3em] text-muted-foreground uppercase [writing-mode:vertical-rl] lg:flex"
        >
          Desliza
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <ArrowDown className="size-4" />
          </motion.span>
        </motion.div>
      </div>
    </section>
  )
}

function FloatingNote({
  label,
  className,
  speed,
  index,
  progress,
}: {
  label: string
  className: string
  speed: number
  index: number
  progress: MotionValue<number>
}) {
  const y = useTransform(progress, [0, 1], [0, speed])
  const opacity = useTransform(progress, [0, 0.4], [1, 0])

  return (
    <motion.div style={{ y, opacity }} className={`absolute z-20 hidden md:block ${className}`}>
      <motion.span
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.6 + index * 0.08 }}
        className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/80 px-4 py-2 text-xs tracking-wide"
      >
        <span className="size-1.5 rounded-full bg-gold" />
        {label}
      </motion.span>
    </motion.div>
  )
}
