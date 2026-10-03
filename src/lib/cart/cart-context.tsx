"use client"

import { createContext, use, useCallback, useEffect, useMemo, useReducer } from "react"
import { formatPrice } from "@/lib/catalog/format"
import type { Product } from "@/lib/catalog/types"

export type CartItem = {
  id: string
  slug: string
  name: string
  image?: string
  hue: number
  size?: string
  price: number
  currency: string
  maxQuantity: number
  quantity: number
}

type State = { items: CartItem[]; open: boolean; hydrated: boolean }

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; product: Product; quantity: number }
  | { type: "setQuantity"; id: string; quantity: number }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "setOpen"; open: boolean }

const STORAGE_KEY = "versatille-cart"

function clamp(quantity: number, max: number) {
  return Math.max(1, Math.min(quantity, Math.max(max, 1)))
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, items: action.items, hydrated: true }
    case "add": {
      const { product } = action
      const existing = state.items.find((item) => item.id === product.id)
      const items = existing
        ? state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: clamp(item.quantity + action.quantity, product.maxQuantity) }
              : item,
          )
        : [
            ...state.items,
            {
              id: product.id,
              slug: product.slug,
              name: product.name,
              image: product.image,
              hue: product.hue,
              size: product.size,
              price: product.price,
              currency: product.currency,
              maxQuantity: product.maxQuantity,
              quantity: clamp(action.quantity, product.maxQuantity),
            },
          ]
      return { ...state, items, open: true }
    }
    case "setQuantity":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: clamp(action.quantity, item.maxQuantity) } : item,
        ),
      }
    case "remove":
      return { ...state, items: state.items.filter((item) => item.id !== action.id) }
    case "clear":
      return { ...state, items: [] }
    case "setOpen":
      return { ...state, open: action.open }
  }
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotalLabel: string
  open: boolean
  setOpen: (open: boolean) => void
  add: (product: Product, quantity?: number) => void
  setQuantity: (id: string, quantity: number) => void
  remove: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], open: false, hydrated: false })

  // El carrito vive en este navegador; si el almacenamiento no está disponible, empieza vacío.
  useEffect(() => {
    let items: CartItem[] = []
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) items = JSON.parse(saved) as CartItem[]
    } catch {}
    dispatch({ type: "hydrate", items: Array.isArray(items) ? items : [] })
  }, [])

  useEffect(() => {
    if (!state.hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {}
  }, [state.items, state.hydrated])

  const add = useCallback((product: Product, quantity = 1) => {
    if (!product.available) return
    dispatch({ type: "add", product, quantity })
  }, [])
  const setQuantity = useCallback((id: string, quantity: number) => dispatch({ type: "setQuantity", id, quantity }), [])
  const remove = useCallback((id: string) => dispatch({ type: "remove", id }), [])
  const clear = useCallback(() => dispatch({ type: "clear" }), [])
  const setOpen = useCallback((open: boolean) => dispatch({ type: "setOpen", open }), [])

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const currency = state.items[0]?.currency ?? "COP"
    return {
      items: state.items,
      count,
      subtotalLabel: formatPrice(subtotal, currency),
      open: state.open,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
    }
  }, [state.items, state.open, add, setQuantity, remove, clear, setOpen])

  return <CartContext value={value}>{children}</CartContext>
}

export function useCart() {
  const context = use(CartContext)
  if (!context) throw new Error("useCart debe usarse dentro de <CartProvider>")
  return context
}
