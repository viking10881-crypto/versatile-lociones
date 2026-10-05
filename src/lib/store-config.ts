// Datos públicos del negocio que usa el checkout.

/** WhatsApp del dueño, con indicativo de Colombia, para validar comprobantes. */
export const OWNER_WHATSAPP = "573116363311"

/** Cuenta Nequi a la que transfieren los clientes. */
export const NEQUI_NUMBER = "3116363311"

export function formatPhone(number: string) {
  return number.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3")
}

export function whatsappLink(message: string) {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`
}
