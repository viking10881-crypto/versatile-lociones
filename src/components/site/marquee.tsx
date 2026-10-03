"use client"

import { useRef } from "react"
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react"

const fallbackWords = ["Floral", "Amaderada", "Cítrica", "Oriental"]

/** Cinta infinita que acelera y cambia de sentido según la velocidad del scroll. */
export function Marquee({ words: families = [], baseVelocity = -2 }: { words?: string[]; baseVelocity?: number }) {
  const words = [...(families.length > 0 ? families : fallbackWords), "Eau de Parfum", "Hecho con intención"]
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const x = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false })
  const skew = useTransform(velocity, [-2000, 2000], [8, -8])
  const direction = useRef(1)
  const translate = useTransform(x, (v) => `${wrap(-25, -50, v)}%`)

  useAnimationFrame((_, delta) => {
    if (!inView) return // fuera de pantalla no consume fotogramas
    let move = direction.current * baseVelocity * (delta / 1000)
    const f = factor.get()
    if (f < 0) direction.current = -1
    else if (f > 0) direction.current = 1
    move += direction.current * move * f
    x.set(x.get() + move)
  })

  return (
    <section ref={ref} aria-label="Familias olfativas" className="overflow-hidden border-y border-border py-6 sm:py-8">
      <motion.div style={{ x: translate, skewX: skew }} className="flex will-change-transform w-max whitespace-nowrap">
        {Array.from({ length: 4 }).map((_, copy) => (
          <div key={copy} aria-hidden={copy > 0} className="flex shrink-0">
            {words.map((word) => (
              <span key={word} className="flex items-center font-serif text-5xl font-light sm:text-7xl">
                <span className="px-6 sm:px-10">{word}</span>
                <span className="text-3xl text-gold">✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  )
}
