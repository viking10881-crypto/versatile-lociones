import "server-only"

// Llamadas sin caché a la API pública de Delasoft (login, ventas, perfil...). La API key y el
// origen permitido se agregan aquí; nunca llegan al navegador.

export type DelasoftResult<T> =
  | { ok: true; status: number; data: T; body: Record<string, unknown> }
  | { ok: false; status: number; message: string; code?: string }

type RequestOptions = {
  method?: "GET" | "POST" | "PUT"
  json?: unknown
  formData?: FormData
  /** Token de acceso del cliente (Bearer). */
  token?: string
}

export function delasoftBaseUrl() {
  return (process.env.DELASOFT_PUBLIC_API_URL || "https://delasoft-back.onrender.com/public-api/v1").replace(/\/$/, "")
}

export async function delasoftApi<T>(path: string, options: RequestOptions = {}): Promise<DelasoftResult<T>> {
  const headers: Record<string, string> = {
    "X-API-Key": process.env.DELASOFT_PUBLIC_API_KEY ?? "",
  }
  if (process.env.DELASOFT_STORE_ORIGIN) headers.Origin = process.env.DELASOFT_STORE_ORIGIN
  if (options.token) headers.Authorization = `Bearer ${options.token}`
  if (options.json !== undefined) headers["Content-Type"] = "application/json"

  let res: Response
  try {
    res = await fetch(`${delasoftBaseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.formData ?? (options.json !== undefined ? JSON.stringify(options.json) : undefined),
      cache: "no-store",
      signal: AbortSignal.timeout(45_000), // Render puede tardar en despertar
    })
  } catch {
    return { ok: false, status: 503, message: "No pudimos conectar con la tienda. Intenta de nuevo en un momento." }
  }

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok || body.success === false) {
    return {
      ok: false,
      status: res.status,
      message: typeof body.message === "string" ? body.message : "Ocurrió un error inesperado.",
      code: typeof body.code === "string" ? body.code : undefined,
    }
  }
  return { ok: true, status: res.status, data: (body.data ?? body) as T, body }
}
