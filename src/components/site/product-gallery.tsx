"use client"

import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, type PanInfo } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"
import { ease } from "@/components/motion/reveal"
import { BottleArt } from "./product-visual"

const SWIPE_THRESHOLD = 60

/** Galería del detalle: varias fotos del mismo producto, con miniaturas, swipe, teclado y zoom. */
export function ProductGallery({ product }: { product: Product }) {
  const images = product.images
  const [[index, direction], setState] = useState<[number, number]>([0, 0])
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const hasMany = images.length > 1

  function go(next: number) {
    if (!hasMany) return
    const wrapped = (next + images.length) % images.length
    setState([wrapped, next > index ? 1 : -1])
    setZoom(null)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) go(index + 1)
    else if (info.offset.x > SWIPE_THRESHOLD) go(index - 1)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }

  const background = {
    background: `radial-gradient(120% 80% at 50% 100%, oklch(0.9 0.05 ${product.hue}), oklch(0.96 0.012 85))`,
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {hasMany ? (
        <div
          data-lenis-prevent
          role="tablist"
          aria-label="Fotos del producto"
          className="flex gap-3 overflow-x-auto pb-1 lg:max-h-[min(80svh,46rem)] lg:flex-col lg:overflow-y-auto lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Foto ${i + 1} de ${images.length}`}
              onClick={() => go(i)}
              className={cn(
                "relative size-18 shrink-0 overflow-hidden rounded-md border-2 p-1 transition-colors lg:size-20",
                i === index ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100",
              )}
              style={background}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-1 mix-blend-multiply" />
            </button>
          ))}
        </div>
      ) : null}

      <div
        tabIndex={hasMany ? 0 : -1}
        aria-roledescription="carrusel"
        aria-label={`${product.name}, foto ${index + 1} de ${Math.max(images.length, 1)}`}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(index + 1)
          if (event.key === "ArrowLeft") go(index - 1)
        }}
        className="group relative aspect-square flex-1 overflow-hidden rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:aspect-4/5"
        style={background}
      >
        {images.length === 0 ? (
          <BottleArt hue={product.hue} className="absolute inset-[12%] h-[76%] w-[76%]" />
        ) : (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={index}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ x: dir >= 0 ? "40%" : "-40%", opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({ x: dir >= 0 ? "-40%" : "40%", opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease }}
              drag={hasMany ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setZoom(null)}
              className="absolute inset-0 cursor-zoom-in touch-pan-y"
            >
              {/* Zoom con el ratón: la imagen se amplía hacia donde apunta el cursor */}
              <div
                className="absolute inset-[8%] transition-transform duration-300 ease-out"
                style={{
                  transform: zoom ? "scale(1.9)" : "scale(1)",
                  transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%",
                }}
              >
                <Image
                  src={images[index]}
                  alt={`${product.name}${images.length > 1 ? ` — foto ${index + 1}` : ""}`}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  draggable={false}
                  className="pointer-events-none object-contain mix-blend-multiply select-none"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {product.badge ? (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
            {product.badge}
          </span>
        ) : null}

        {hasMany ? (
          <>
            <span className="absolute top-4 right-4 z-10 rounded-full bg-background/90 px-3 py-1 font-mono text-xs tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
            {/* Centrado con un contenedor: el botón usa translate al presionarse */}
            <div className="absolute inset-y-0 left-3 z-10 hidden items-center sm:flex">
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => go(index - 1)}
                aria-label="Foto anterior"
                className="rounded-full bg-background/90 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <ChevronLeft />
              </Button>
            </div>
            {/* Centrado con un contenedor: el botón usa translate al presionarse */}
            <div className="absolute inset-y-0 right-3 z-10 hidden items-center sm:flex">
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => go(index + 1)}
                aria-label="Foto siguiente"
                className="rounded-full bg-background/90 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <ChevronRight />
              </Button>
            </div>
            {/* Indicador para móvil, donde se navega deslizando */}
            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5 sm:hidden" aria-hidden>
              {images.map((src, i) => (
                <span
                  key={src}
                  className={cn(
                    "h-1.5 rounded-full bg-foreground transition-all duration-300",
                    i === index ? "w-5" : "w-1.5 opacity-30",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
