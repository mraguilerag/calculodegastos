import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Budget, Category, Expense, Settings } from '../types'
import { DEFAULT_CATEGORIES, CATEGORY_COLOR_PALETTE } from '../data/defaultCategories'
import { DEFAULT_CURRENCY_CODE } from '../data/currencies'
import { makeId, slugify } from '../lib/id'
import { todayISO } from '../lib/dates'
import {
  fetchCloudData,
  insertExpenseRow,
  updateExpenseRow,
  deleteExpenseRow,
  insertCategoryRow,
  deleteCategoryRow,
  reassignExpensesCategory,
  updateProfileRow,
  migrateLocalDataToCloud,
} from '../lib/cloudSync'
import { consumePendingMigration } from '../lib/pendingMigration'

export interface NewExpenseInput {
  amount: number | string
  categoryId: string
  description?: string
  date?: string
}

export interface NewCategoryInput {
  name: string
  color?: string
  icon?: string
}

type DataMode = 'local' | 'cloud'

interface AppState {
  mode: DataMode
  userId: string | null
  expenses: Expense[]
  categories: Category[]
  budget: Budget
  settings: Settings
  /** null = todavia no se le pregunto; '' = eligio no dar su nombre; si no, el nombre elegido. */
  profileName: string | null
  /** Se incrementa cada vez que se guarda un gasto; el corazon 3D lo observa para animar su reaccion. */
  reactionTick: number

  addExpense: (input: NewExpenseInput) => Promise<Expense>
  updateExpense: (id: string, patch: Partial<NewExpenseInput>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  addCategory: (input: NewCategoryInput) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>

  setMonthlyLimit: (value: number | null) => Promise<void>
  setTheme: (theme: Settings['theme']) => void
  toggleTheme: () => void
  toggleSound: () => void
  setCurrency: (code: string) => void
  /** Guarda el nombre a mostrar (cadena vacia = "eligio no dar su nombre"). */
  setProfileName: (name: string) => Promise<void>

  /** Carga los datos de la nube tras iniciar sesion y pasa el store a modo 'cloud'. Devuelve cuantos gastos locales se migraron, si corresponde. */
  loadFromCloud: (userId: string) => Promise<number>
  /** Vuelve a modo 'local', releyendo el respaldo de localStorage (no el que se acaba de ver en la nube). */
  switchToLocalMode: () => void
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  soundEnabled: true,
  currency: DEFAULT_CURRENCY_CODE,
}

const STORAGE_NAME = 'gastitos-kawaii-store'

function normalizeAmount(value: number | string): number {
  const num = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error('Ingresa un monto valido mayor a 0.')
  }
  return Math.round(num * 100) / 100
}

interface LocalSnapshot {
  expenses: Expense[]
  categories: Category[]
  budget: Budget
  settings: Settings
}

/** Lee el respaldo local tal cual quedo la ultima vez que el store estuvo en modo 'local'. */
function readLocalSnapshot(): LocalSnapshot {
  const fallback: LocalSnapshot = {
    expenses: [],
    categories: DEFAULT_CATEGORIES,
    budget: { monthlyLimit: null },
    settings: DEFAULT_SETTINGS,
  }
  try {
    const raw = localStorage.getItem(STORAGE_NAME)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    const s = parsed?.state ?? {}
    return {
      expenses: Array.isArray(s.expenses) ? s.expenses : [],
      categories: Array.isArray(s.categories) && s.categories.length ? s.categories : DEFAULT_CATEGORIES,
      budget: s.budget ?? fallback.budget,
      settings: { ...DEFAULT_SETTINGS, ...(s.settings ?? {}) },
    }
  } catch {
    return fallback
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: 'local',
      userId: null,
      expenses: [],
      categories: DEFAULT_CATEGORIES,
      budget: { monthlyLimit: null },
      settings: DEFAULT_SETTINGS,
      profileName: null,
      reactionTick: 0,

      addExpense: async (input) => {
        const amount = normalizeAmount(input.amount)
        if (!input.categoryId) throw new Error('Elige una categoria.')
        const date = input.date || todayISO()
        const description = (input.description ?? '').trim()

        if (get().mode === 'cloud') {
          const userId = get().userId
          if (!userId) throw new Error('No hay sesion activa.')
          const expense = await insertExpenseRow(userId, { amount, categoryId: input.categoryId, description, date })
          set((state) => ({ expenses: [...state.expenses, expense], reactionTick: state.reactionTick + 1 }))
          return expense
        }

        const expense: Expense = {
          id: makeId('exp'),
          amount,
          categoryId: input.categoryId,
          description,
          date,
          createdAt: Date.now(),
        }
        set((state) => ({
          expenses: [...state.expenses, expense],
          reactionTick: state.reactionTick + 1,
        }))
        return expense
      },

      updateExpense: async (id, patch) => {
        const normalizedPatch: Partial<Pick<Expense, 'amount' | 'categoryId' | 'description' | 'date'>> = {}
        if (patch.amount !== undefined) normalizedPatch.amount = normalizeAmount(patch.amount)
        if (patch.categoryId !== undefined) normalizedPatch.categoryId = patch.categoryId
        if (patch.description !== undefined) normalizedPatch.description = patch.description.trim()
        if (patch.date !== undefined) normalizedPatch.date = patch.date

        if (get().mode === 'cloud') {
          await updateExpenseRow(id, normalizedPatch)
        }

        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...normalizedPatch } : e)),
        }))
      },

      deleteExpense: async (id) => {
        if (get().mode === 'cloud') {
          await deleteExpenseRow(id)
        }
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }))
      },

      addCategory: async (input) => {
        const trimmed = input.name.trim()
        if (!trimmed) throw new Error('El nombre de la categoria no puede estar vacio.')
        const existing = get().categories
        const color = input.color || CATEGORY_COLOR_PALETTE[existing.length % CATEGORY_COLOR_PALETTE.length]
        const icon = input.icon || '🐾'

        if (get().mode === 'cloud') {
          const userId = get().userId
          if (!userId) throw new Error('No hay sesion activa.')
          const category = await insertCategoryRow(userId, { name: trimmed, icon, color })
          set((state) => ({ categories: [...state.categories, category] }))
          return category
        }

        let id = slugify(trimmed)
        let suffix = 1
        while (existing.some((c) => c.id === id)) {
          id = `${slugify(trimmed)}-${suffix++}`
        }
        const category: Category = { id, name: trimmed, icon, color, isDefault: false }
        set((state) => ({ categories: [...state.categories, category] }))
        return category
      },

      deleteCategory: async (id) => {
        const target = get().categories.find((c) => c.id === id)
        if (!target || target.isDefault) return
        const fallbackId = get().categories.find((c) => c.id === 'otros' || c.name === 'Otros')?.id ?? 'otros'

        if (get().mode === 'cloud') {
          const userId = get().userId
          if (!userId) throw new Error('No hay sesion activa.')
          await reassignExpensesCategory(userId, id, fallbackId)
          await deleteCategoryRow(id)
        }

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          expenses: state.expenses.map((e) => (e.categoryId === id ? { ...e, categoryId: fallbackId } : e)),
        }))
      },

      setMonthlyLimit: async (value) => {
        if (value !== null && (!Number.isFinite(value) || value < 0)) {
          throw new Error('Ingresa un presupuesto valido.')
        }
        if (get().mode === 'cloud') {
          const userId = get().userId
          if (!userId) throw new Error('No hay sesion activa.')
          await updateProfileRow(userId, { monthlyLimit: value })
        }
        set({ budget: { monthlyLimit: value } })
      },

      setTheme: (theme) => {
        set((state) => ({ settings: { ...state.settings, theme } }))
        const userId = get().userId
        if (get().mode === 'cloud' && userId) void updateProfileRow(userId, { theme })
      },
      toggleTheme: () => {
        get().setTheme(get().settings.theme === 'dark' ? 'light' : 'dark')
      },
      toggleSound: () => {
        const next = !get().settings.soundEnabled
        set((state) => ({ settings: { ...state.settings, soundEnabled: next } }))
        const userId = get().userId
        if (get().mode === 'cloud' && userId) void updateProfileRow(userId, { soundEnabled: next })
      },
      setCurrency: (code) => {
        set((state) => ({ settings: { ...state.settings, currency: code } }))
        const userId = get().userId
        if (get().mode === 'cloud' && userId) void updateProfileRow(userId, { currency: code })
      },

      setProfileName: async (name) => {
        const userId = get().userId
        if (get().mode === 'cloud' && userId) {
          await updateProfileRow(userId, { name })
        }
        set({ profileName: name })
      },

      loadFromCloud: async (userId) => {
        let migratedCount = 0
        if (consumePendingMigration()) {
          const snapshot = readLocalSnapshot()
          const hasCustomCategories = snapshot.categories.some((c) => !c.isDefault)
          if (snapshot.expenses.length > 0 || hasCustomCategories) {
            migratedCount = await migrateLocalDataToCloud(
              userId,
              snapshot.expenses,
              snapshot.categories,
              snapshot.budget,
              snapshot.settings
            )
          }
        }

        const data = await fetchCloudData(userId)
        set((state) => ({
          mode: 'cloud',
          userId,
          expenses: data.expenses,
          categories: data.categories.length ? data.categories : DEFAULT_CATEGORIES,
          budget: data.budget,
          settings: { ...state.settings, ...data.settings },
          profileName: data.profileName,
        }))
        return migratedCount
      },

      switchToLocalMode: () => {
        const snapshot = readLocalSnapshot()
        set({
          mode: 'local',
          userId: null,
          expenses: snapshot.expenses,
          categories: snapshot.categories,
          budget: snapshot.budget,
          settings: snapshot.settings,
          profileName: null,
        })
      },
    }),
    {
      name: STORAGE_NAME,
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => {
          try {
            const parsed = JSON.parse(value)
            // Nunca se escribe el respaldo local con datos de una cuenta en la nube.
            if (parsed?.state?.mode === 'cloud') return
          } catch {
            // valor inesperado: se deja pasar para no romper la persistencia
          }
          localStorage.setItem(name, value)
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      version: 2,
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<{ settings: Partial<Settings> }>
        const settings: Settings = { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) }
        return { ...p, settings }
      },
      partialize: (state) => ({
        mode: state.mode,
        expenses: state.expenses,
        categories: state.categories,
        budget: state.budget,
        settings: state.settings,
      }),
    }
  )
)
