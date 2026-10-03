"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { Separator } from "@/components/ui/separator"

const columns = [
  { title: "Tienda", links: ["Colección", "Más vendidos", "Sets de regalo", "Muestras"] },
  { title: "Ayuda", links: ["Envíos", "Devoluciones", "Preguntas frecuentes", "Contacto"] },
  { title: "Síguenos", links: ["Instagram", "TikTok", "Facebook", "WhatsApp"] },
]

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] })
  const y = useTransform(scrollYProgress, [0, 1], ["60%", "0%"])

  return (
    <footer ref={ref} className="overflow-hidden bg-[oklch(0.17_0.01_60)] text-[oklch(0.95_0.01_85)]">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-24 sm:px-8 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <p className="max-w-xs font-serif text-2xl leading-snug font-light">
          Lociones de autor para cada momento del día.
        </p>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="mb-4 text-xs tracking-[0.3em] text-[oklch(0.7_0.02_80)] uppercase">{column.title}</p>
            <ul className="space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link}>
                  <a
                    href={link === "Colección" ? "/lociones" : "#"}
                    className="opacity-80 transition-opacity hover:opacity-100"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-8">
        <Separator className="bg-white/10" />
        <div className="flex flex-col justify-between gap-2 py-6 text-xs text-[oklch(0.7_0.02_80)] sm:flex-row">
          <p>© {new Date().getFullYear()} Versatille. Todos los derechos reservados.</p>
          <p>Aviso de privacidad · Términos</p>
        </div>
      </div>
      <motion.p
        aria-hidden
        style={{ y }}
        className="-mb-[0.18em] text-center font-serif text-[22vw] leading-none font-light tracking-tight uppercase select-none"
      >
        Versatille
      </motion.p>
    </footer>
  )
}
