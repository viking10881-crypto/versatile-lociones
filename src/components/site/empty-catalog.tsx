import { Reveal } from "@/components/motion/reveal"
import { BottleArt } from "./product-visual"

/** Se muestra cuando el admin aún no tiene productos publicados. */
export function EmptyCatalog() {
  return (
    <section id="coleccion" className="mx-auto flex max-w-7xl flex-col items-center px-4 py-32 text-center sm:px-8">
      <Reveal className="flex flex-col items-center">
        <BottleArt hue={60} className="h-48 w-32 opacity-80" />
        <h2 className="mt-8 font-serif text-4xl font-light sm:text-5xl">Nuevas fragancias en camino</h2>
        <p className="mt-4 max-w-md text-pretty text-muted-foreground">
          Estamos preparando la colección. Suscríbete abajo y te avisamos en cuanto esté disponible.
        </p>
      </Reveal>
    </section>
  )
}
