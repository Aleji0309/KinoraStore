# Kinora

Tienda de Kinora construida con React y Vite. México y Costa Rica se despliegan desde el mismo código mediante `VITE_MARKET`.

## Desarrollo

Instala dependencias con `npm install`.

El frontend sin Functions puede ejecutarse con:

```sh
VITE_MARKET=CR npm run dev
VITE_MARKET=MX npm run dev
```

## Supabase orders setup

Los pedidos de Costa Rica se crean mediante `/.netlify/functions/create-order`. El frontend nunca se conecta directamente a Supabase y no recibe la service role key.

1. Crea un proyecto en Supabase.
2. Abre el SQL Editor y ejecuta `supabase/migrations/001_create_orders.sql`.
3. En **Project Settings → API**, copia la Project URL.
4. Obtén la service role key. Es un secreto exclusivamente server-side; nunca debe llevar prefijo `VITE_`.
5. En cada entorno que crea pedidos configura:

```text
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
```

6. En Netlify agrega ambas variables desde **Site configuration → Environment variables**. Mantén también `VITE_MARKET=CR` en el Site de Costa Rica y `VITE_MARKET=MX` en el de México.

La migración activa RLS y no crea políticas públicas de escritura. Los inserts se realizan únicamente desde la Netlify Function autenticada con la service role key.

## Probar Functions localmente

Para probar el flujo completo se necesita Netlify CLI, porque `npm run dev` por sí solo no expone `/.netlify/functions/*`.

1. Crea un `.env` no versionado a partir de `.env.example`, cambia `VITE_MARKET` a `CR` y agrega credenciales de un proyecto Supabase de desarrollo. Netlify Dev carga este archivo local.
2. Inicia Netlify Dev para Costa Rica:

```sh
VITE_MARKET=CR npx netlify-cli dev
```

3. Abre la URL local indicada por Netlify CLI, agrega un producto y completa `/checkout`.

Las pruebas automatizadas de la Function usan un cliente Supabase simulado y no requieren secretos:

```sh
npm run test:function
```

## Builds

```sh
VITE_MARKET=CR npm run build
VITE_MARKET=MX npm run build
```

Netlify usa `npm run build`, publica `dist` y obtiene `VITE_MARKET` desde las variables propias de cada Site.
