# Mis Gastos

App de control de gastos personales, por María. Estetica retro kawaii / cute coquette; texto e informacion siempre claros y neutros.

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
  lib/dates.ts               totales del periodo actual, formato de fecha/agrupacion
  lib/periods.ts              navegacion de periodos (semana/mes/ano), rangos y etiquetas
  lib/sound.ts                sintetizador de efectos de sonido (Web Audio API, sin archivos externos)
  lib/exportData.ts            exporta el historial a CSV
  hooks/usePeriodNav.ts         estado del navegador de periodo (semana/mes/ano + offset)
  data/defaultCategories.ts    categorias por defecto
  components/
    layout/                    Header, Footer, AppBackground (skyline SVG con parallax), WelcomeBanner
    heart/                      HeartScene + HeartModel (corazon 3D animado)
    expenses/                   formulario, historial agrupado por fecha, edicion, categorias
    summary/                    totales, navegador de periodo, grafico de dona, desglose semanal, presupuesto
    ui/                         GlassCard, Button, ConfirmDialog, ToastProvider
```

Los datos (gastos, categorias, presupuesto, tema, sonido) se guardan en `localStorage` bajo la llave `gastitos-kawaii-store` y persisten entre sesiones del mismo navegador.
