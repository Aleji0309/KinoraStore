# Kinora

Tienda de Kinora construida con React y Vite. México y Costa Rica comparten el mismo catálogo, repositorio, rama y código; la configuración comercial activa se selecciona durante el build.

## Mercados

La aplicación lee `import.meta.env.VITE_MARKET`:

- `MX`: México (`es-MX`, `MXN`).
- `CR`: Costa Rica (`es-CR`, `CRC`).
- Variable ausente, vacía o no reconocida: se utiliza `MX`.

El catálogo base conserva IDs, slugs, nombres, descripciones, imágenes y demás metadata común. Precios, stock, estado comercial, entrega y contactos se administran por mercado en `src/config/markets.js`.

Todos los productos compartidos están habilitados en ambos mercados. Los valores comerciales temporales se mantienen únicamente en la configuración del mercado correspondiente.

## Desarrollo local

El proyecto usa npm (`package-lock.json`).

```sh
VITE_MARKET=MX npm run dev
VITE_MARKET=CR npm run dev
```

Para crear builds locales:

```sh
VITE_MARKET=MX npm run build
VITE_MARKET=CR npm run build
```

Puede copiarse `.env.example` a un archivo `.env.local` no versionado para evitar indicar la variable en cada comando. No se deben agregar archivos `.env` reales al repositorio.

## Netlify

Crear dos Sites conectados al mismo repositorio y a la misma rama `main`. Ambos utilizan:

- Build command: `npm run build`
- Publish directory: `dist`

Configurar `VITE_MARKET` de forma independiente en **Site configuration → Environment variables**:

- Site México: `VITE_MARKET=MX`
- Site Costa Rica: `VITE_MARKET=CR`

`netlify.toml` no fija ningún mercado y mantiene el fallback SPA hacia `index.html`.
