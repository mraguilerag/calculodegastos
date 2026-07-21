# Gastitos Kawaii

App de control de gastos personales. Estetica retro kawaii / cute coquette; texto e informacion siempre claros y neutros.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + React Three Fiber (+ drei + postprocessing) + Zustand (con persistencia en `localStorage`) + date-fns.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # type-check + build de produccion
npm run preview  # sirve el build de produccion localmente
```

## Estructura

```
src/
  types.ts                 tipos de dominio (Expense, Category, Budget, Settings)
  store/useAppStore.ts      estado global (zustand + persist) y todas las acciones CRUD
  lib/dates.ts               calculo de totales por periodo (hoy/semana/mes/ano)
  lib/sound.ts                sintetizador de efectos de sonido (Web Audio API, sin archivos externos)
  data/defaultCategories.ts    categorias por defecto
  components/
    layout/                    Header, Footer, AppBackground (skyline SVG con parallax)
    cat/                        CatScene + CatModel (gatito 3D)
    expenses/                   formulario, historial, edicion, categorias
    summary/                    totales, grafico de dona, presupuesto mensual
    ui/                         GlassCard, Button, ConfirmDialog, ToastProvider
```

Los datos (gastos, categorias, presupuesto, tema, sonido) se guardan en `localStorage` bajo la llave `gastitos-kawaii-store` y persisten entre sesiones del mismo navegador.
