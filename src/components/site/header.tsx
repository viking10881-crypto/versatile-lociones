"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react"
import { Menu, ShoppingBag, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCart } from "@/lib/cart/cart-context"
import { cn } from "@/lib/utils"
import { ease } from "@/components/motion/reveal"
import { CartSheet } from "./cart-sheet"

const links = [
  { label: "Lociones", href: "/lociones" },
  { label: "Familias", href: "/#familias" },
  { label: "Más vendidos", href: "/#mas-vendidos" },
  { label: "Nosotros", href: "/#nosotros" },
]

export function Header() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { count, setOpen } = useCart()

  // Se oculta al bajar y reaparece al subir; gana fondo al dejar el inicio.
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setHidden(y > previous && y > 200)
    setScrolled(y > 40)
  })

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 transition-[background-color,border-color,backdrop-filter] duration-500 sm:px-8 lg:mt-3 lg:rounded-full lg:border",
          scrolled
            ? "border-border/60 bg-background/85 backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      >
        <Link href="/" className="font-serif text-2xl tracking-[0.2em] uppercase">
          Versatille
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-foreground transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon-lg" aria-label="Mi cuenta">
            <Link href="/cuenta">
              <UserRound />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="relative"
            onClick={() => setOpen(true)}
            aria-label={`Carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
          >
            <ShoppingBag />
            <AnimatePresence>
              {count > 0 ? (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -top-0.5 -right-0.5 grid min-w-4.5 place-items-center rounded-full bg-foreground px-1 text-[10px] leading-4.5 font-medium text-background tabular-nums"
                >
                  {count}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label="Abrir menú">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl tracking-[0.2em] uppercase">
                  Versatille
                </SheetTitle>
                <SheetDescription className="sr-only">Navegación principal</SheetDescription>
              </SheetHeader>
              <nav aria-label="Móvil" className="flex flex-col px-4">
                {links.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className="py-4 font-serif text-3xl">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CartSheet />
    </motion.header>
  )
}
