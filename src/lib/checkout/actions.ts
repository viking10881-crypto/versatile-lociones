"use server"

import { delasoftApi } from "@/lib/delasoft/api"
import { getAccessToken, getSessionUser } from "@/lib/auth/session"
import { formatPhone, NEQUI_NUMBER } from "@/lib/store-config"

export type OrderResult =
  | { ok: true; saleNumber: string; total: number; receiptUrl: string }
  | { ok: false; error: string; needsLogin?: boolean; fieldErrors?: Record<string, string> }

const MAX_RECEIPT_BYTES = 4 * 1024 * 1024
const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp"]

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

/** Registra el pedido pagado por Nequi en Delasoft con su comprobante. */
export async function placeNequiOrder(formData: FormData): Promise<OrderResult> {
  const token = await getAccessToken({ canRefresh: true })
  const user = await getSessionUser()
  if (!token || !user) {
    return { ok: false, needsLogin: true, error: "Tu sesión expiró. Ingresa de nuevo para terminar la compra." }
  }

  let items: { product_id: number; quantity: number }[] = []
  try {
    const parsed = JSON.parse(text(formData, "items")) as { id: string; quantity: number }[]
    items = parsed
      .map((item) => ({ product_id: Number(item.id), quantity: Math.floor(Number(item.quantity)) }))
      .filter((item) => Number.isInteger(item.product_id) && item.quantity > 0)
  } catch {}
  if (items.length === 0) return { ok: false, error: "Tu carrito está vacío." }

  const phone = text(formData, "phone").replace(/\D/g, "")
  const city = text(formData, "city")
  const address = text(formData, "address")
  const notes = text(formData, "notes").slice(0, 300)
  const receipt = formData.get("receipt")

  const fieldErrors: Record<string, string> = {}
  if (phone.length !== 10) fieldErrors.phone = "Escribe un celular de 10 dígitos."
  if (city.length < 3) fieldErrors.city = "Escribe la ciudad de entrega."
  if (address.length < 6) fieldErrors.address = "Escribe la dirección completa."
  if (!(receipt instanceof File) || receipt.size === 0) {
    fieldErrors.receipt = "Sube la captura del comprobante de Nequi."
  } else if (!RECEIPT_TYPES.includes(receipt.type)) {
    fieldErrors.receipt = "El comprobante debe ser una imagen JPG, PNG o WebP."
  } else if (receipt.size > MAX_RECEIPT_BYTES) {
    fieldErrors.receipt = "La imagen es muy pesada. Intenta con una captura de pantalla."
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Revisa los datos marcados.", fieldErrors }
  }

  // 1. El comprobante se guarda en Delasoft (Cloudinary) para que el dueño lo vea desde el admin.
  const upload = new FormData()
  upload.append("image", receipt as File)
  const uploaded = await delasoftApi<{ url: string }>("/upload", { method: "POST", token, formData: upload })
  if (!uploaded.ok) {
    if (uploaded.status === 401) return { ok: false, needsLogin: true, error: "Tu sesión expiró. Ingresa de nuevo." }
    return { ok: false, error: `No pudimos subir el comprobante: ${uploaded.message}` }
  }
  const receiptUrl = uploaded.data.url

  // 2. La venta queda registrada en el admin como transferencia con pago pendiente de validar.
  const shippingNotes = [
    `Pago por Nequi al ${formatPhone(NEQUI_NUMBER)}.`,
    `Comprobante: ${receiptUrl}`,
    notes ? `Notas del cliente: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  const sale = await delasoftApi<{ sale_number: string; total: string | number }>("/sales", {
    method: "POST",
    token,
    json: {
      items,
      payment_method: "transfer",
      customer_phone: phone,
      shipping_address: address,
      shipping_city: city,
      shipping_notes: shippingNotes,
    },
  })
  if (!sale.ok) {
    if (sale.status === 401) return { ok: false, needsLogin: true, error: "Tu sesión expiró. Ingresa de nuevo." }
    return { ok: false, error: sale.message }
  }

  // 3. Se guardan los datos de envío en el perfil para la próxima compra (si falla, no importa).
  await delasoftApi("/auth/profile", {
    method: "PUT",
    token,
    json: { name: user.name, phone, city, address },
  }).catch(() => null)

  return { ok: true, saleNumber: sale.data.sale_number, total: Number(sale.data.total), receiptUrl }
}
