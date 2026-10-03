"use client"

import { motion, type HTMLMotionProps } from "motion/react"

export const ease = [0.22, 1, 0.36, 1] as const

type RevealProps = HTMLMotionProps<"div"> & { delay?: number; y?: number }

/** Aparece desde abajo con desvanecido la primera vez que entra en pantalla. */
export function Reveal({ delay = 0, y = 28, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.75, ease, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type SplitTextProps = {
  text: string
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  /** "words" para párrafos, "chars" para titulares cortos. */
  by?: "words" | "chars"
  animateOnMount?: boolean
}

/** Cada palabra o letra sube desde una máscara, como en las portadas editoriales. */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  duration = 0.7,
  by = "words",
  animateOnMount = false,
}: SplitTextProps) {
  const parts = by === "words" ? text.split(" ") : Array.from(text)
  const trigger = animateOnMount
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, margin: "-5% 0px" } }

  return (
    <motion.span
      aria-label={text}
      className={className}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {parts.map((part, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%" },
              show: { y: "0%", transition: { duration, ease } },
            }}
          >
            {part === " " ? " " : part}
          </motion.span>
          {by === "words" && i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </motion.span>
  )
}
