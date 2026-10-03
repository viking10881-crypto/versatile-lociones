"use client"

import { useState } from "react"
import { motion, useMotionValueEvent, useScroll } from "motion/react"
import { Menu, Search, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ease } from "@/components/motion/reveal"

const links = [
  { label: "Colección", href: "#coleccion" },
  { label: "Familias", href: "#familias" },
  { label: "Más vendidos", href: "#mas-vendidos" },
  { label: "Nosotros", href: "#nosotros" },
]

export function Header() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
        <a href="#" className="font-serif text-2xl tracking-[0.2em] uppercase">
          Versatille
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-foreground transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-lg" aria-label="Buscar">
            <Search />
          </Button>
          <CartSheet />
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
                    <a href={link.href} className="py-4 font-serif text-3xl">
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

function CartSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" aria-label="Carrito, 0 productos">
          <ShoppingBag />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-3xl font-normal">Tu carrito</SheetTitle>
          <SheetDescription>Aún no has agregado fragancias.</SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1} />
          <p className="max-w-60 text-sm text-muted-foreground">
            Explora la colección y encuentra el aroma que te represente.
          </p>
          <SheetClose asChild>
            <Button asChild className="rounded-full px-6">
              <a href="#coleccion">Ver colección</a>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
