"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"
import { Reveal } from "@/components/motion/reveal"

const text =
  "Creemos que un aroma es memoria que se lleva puesta. Cada loción Versatille nace de ingredientes seleccionados y se equilibra para acompañarte del primer café a la última copa."

/** Párrafo que se ilumina palabra por palabra mientras se recorre. */
export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] })
  const words = text.split(" ")

  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-4 py-32 sm:px-8 sm:py-48">
      <Reveal>
        <p className="mb-10 text-xs tracking-[0.3em] text-muted-foreground uppercase">Nuestra esencia</p>
      </Reveal>
      <p ref={ref} className="font-serif text-4xl leading-[1.15] font-light text-balance sm:text-6xl">
        {words.map((word, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {word}
          </Word>
        ))}
      </p>
    </section>
  )
}

function Word({
  children,
  progress,
  range,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}{" "}
    </motion.span>
  )
}
