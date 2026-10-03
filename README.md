# Versatille — tienda de lociones

Next.js 16 + shadcn/ui + Motion + Lenis. Los productos se administran desde **Delasoft** (`delasoft_front`).

```bash
pnpm install
pnpm dev
```

## Conectar con Delasoft

1. En el admin de Delasoft: **Herramientas → API Keys** → crear una clave con el permiso
   **Ver productos** (`products:read`). Opcional: **Ver categorías** (`categories:read`) para usar
   las descripciones de las categorías.
2. Copiar `.env.example` a `.env.local` (y configurar las mismas variables en Vercel):

   ```
   DELASOFT_PUBLIC_API_URL=https://delasoft-back.onrender.com/public-api/v1
   DELASOFT_PUBLIC_API_KEY=ak_...
   DELASOFT_STORE_ORIGIN=https://versatille-lociones-delasoft.vercel.app
   ```

   `DELASOFT_STORE_ORIGIN` debe coincidir con uno de los orígenes permitidos de la clave; si no,
   Delasoft responde `ORIGIN_NOT_ALLOWED`.

Sin `DELASOFT_PUBLIC_API_KEY` la tienda muestra productos de ejemplo (`src/lib/catalog/demo.ts`).
La clave solo se usa en el servidor y nunca llega al navegador.

## Cómo cargar los productos en el admin

| En el admin de Delasoft | En la tienda |
|---|---|
| Producto **activo y publicado** | Aparece en máximo 60 s |
| Categoría (p. ej. *Florales*, *Amaderadas*) | Familia olfativa y color del frasco |
| Imagen principal | Foto del producto (mejor con fondo blanco o transparente) |
| Línea `Notas: Ámbar, Vainilla, Oud` en la descripción | Notas olfativas |
| Variante de tamaño, o `100 ml` en el nombre | Tamaño |
| Descuento con alcance *web* o *todos* | Precio rebajado y etiqueta `-20%` |
| Stock en 0 / bajo el mínimo | Etiqueta *Agotado* / *Últimas unidades* |
| Moneda del perfil del negocio | Formato de precios (COP por defecto) |

El producto destacado de la portada es el más reciente que tenga foto.

## Estructura

- `src/lib/catalog/delasoft.ts` — cliente de la API pública y mapeo al modelo de la tienda.
- `src/lib/catalog/index.ts` — `getCatalog()`: Delasoft o datos de ejemplo. Si Delasoft falla
  durante una revalidación se sigue sirviendo la última versión buena.
- `src/components/site/*` — secciones de la home.
