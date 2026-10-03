// Utilidades compartidas entre Delasoft y los datos de ejemplo.

export function formatPrice(value: number, currency = "COP") {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)
  }
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Tono y descripción por familia olfativa; se reconocen por palabra clave en la categoría.
const familyStyles: { match: string; hue: number; description: string }[] = [
  { match: "floral", hue: 350, description: "Pétalos frescos, románticos y luminosos" },
  { match: "amader", hue: 60, description: "Maderas nobles, cálidas y envolventes" },
  { match: "citri", hue: 95, description: "Frescura vibrante para el día a día" },
  { match: "orient", hue: 30, description: "Especias, ámbar y misterio nocturno" },
  { match: "ambar", hue: 30, description: "Especias, ámbar y misterio nocturno" },
  { match: "acuat", hue: 210, description: "Brisa marina, limpia y ligera" },
  { match: "fresc", hue: 190, description: "Notas limpias y ligeras para cualquier momento" },
  { match: "dulce", hue: 340, description: "Gourmand, cremosa y envolvente" },
  { match: "gourmand", hue: 340, description: "Gourmand, cremosa y envolvente" },
]

export function familyStyle(name: string) {
  const slug = slugify(name)
  const known = familyStyles.find((style) => slug.includes(style.match))
  if (known) return { hue: known.hue, description: known.description }
  // Tono estable para categorías no previstas.
  let hash = 0
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return { hue: hash, description: "" }
}
