# ACFC Kitchen — Backend SaaS Gastronómico

Backend de gestión gastronómica conectado a Supabase. Incluye API REST con Express y esquema SQL completo.

## Estructura

```
├── server.js              # API Express (forecast, purchase orders)
├── supabase_schema.sql    # Esquema completo de base de datos
├── lib/
│   └── supabaseClient.js  # Cliente oficial de Supabase
├── test-db.js             # Script de validación de conexión
└── package.json
```

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/forecast` | Explosión de ingredientes por rango de fechas |
| `POST` | `/api/purchase-orders/optimize` | Genera órdenes optimizadas al proveedor más barato |

## Variables de Entorno

Crea un archivo `.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=https://aosweyggyalowhogjatz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
```

## Instalación

```bash
npm install
node server.js
```

## Base de Datos (Supabase)

Las tablas principales están definidas en `supabase_schema.sql`:
- `ingredients` — Catálogo de insumos con stock
- `recipes` + `recipe_ingredients` — Recetas y explosión de ingredientes
- `suppliers` + `supplier_prices` — Proveedores y precios
- `menu_planning` — Planificación mensual de menús
- `purchase_budgets` + `purchase_orders` — Presupuestos y órdenes de compra
