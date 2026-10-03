import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BottleArt } from "@/components/site/product-visual"

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 pt-32 pb-24 text-center">
      <BottleArt hue={60} className="h-40 w-28 opacity-70" />
      <h1 className="mt-8 font-serif text-5xl font-light">No encontramos esta fragancia</h1>
      <p className="mt-4 max-w-md text-pretty text-muted-foreground">
        Puede que ya no esté disponible o que el enlace haya cambiado.
      </p>
      <Button asChild size="lg" className="mt-8 h-12 rounded-full px-6">
        <Link href="/lociones">Ver todas las lociones</Link>
      </Button>
    </main>
  )
}
