import Image from "next/image"
import logo from "../../../public/brand/versatile-logo.webp"

/** Marco de las pantallas de cuenta: formulario a la izquierda, logo de la marca a la derecha. */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main className="flex-1">
      <div className="mx-auto grid min-h-svh max-w-7xl items-center gap-12 px-4 pt-28 pb-20 sm:px-8 lg:grid-cols-2">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-5xl leading-none font-light">{title}</h1>
          {description ? <div className="mt-4 text-pretty text-muted-foreground">{description}</div> : null}
          <div className="mt-10">{children}</div>
        </div>
        <div className="relative hidden aspect-square max-h-[75svh] overflow-hidden rounded-lg lg:block">
          <Image
            src={logo}
            alt="Versatile — Estilo que te acompaña"
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 45vw, 0px"
            className="object-cover"
          />
        </div>
      </div>
    </main>
  )
}
