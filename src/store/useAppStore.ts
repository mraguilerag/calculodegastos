import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Budget, Category, Expense, Settings } from '../types'
import { DEFAULT_CATEGORIES, CATEGORY_COLOR_PALETTE } from '../data/defaultCategories'
import { DEFAULT_CURRENCY_CODE } from '../data/currencies'
import { makeId, slugify } from '../lib/id'
import { todayISO } from '../lib/dates'

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

interface AppState {
  expenses: Expense[]
  categories: Category[]
  budget: Budget
  settings: Settings
  /** Se incrementa cada vez que se guarda un gasto; el gatito 3D lo observa para animar su reaccion. */
  reactionTick: number

  addExpense: (input: NewExpenseInput) => Expense
  updateExpense: (id: string, patch: Partial<NewExpenseInput>) => void
  deleteExpense: (id: string) => void

  addCategory: (input: NewCategoryInput) => Category
  deleteCategory: (id: string) => void

  setMonthlyLimit: (value: number | null) => void
  setTheme: (theme: Settings['theme']) => void
  toggleTheme: () => void
  toggleSound: () => void
  setCurrency: (code: string) => void
  chooseSoundPreference: (enabled: boolean) => void
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  soundEnabled: true,
  currency: DEFAULT_CURRENCY_CODE,
  hasChosenSound: false,
}

function normalizeAmount(value: number | string): number {
  const num = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error('Ingresa un monto valido mayor a 0.')
  }
  return Math.round(num * 100) / 100
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      expenses: [],
      categories: DEFAULT_CATEGORIES,
      budget: { monthlyLimit: null },
      settings: DEFAULT_SETTINGS,
      reactionTick: 0,

      addExpense: (input) => {
        const amount = normalizeAmount(input.amount)
        if (!input.categoryId) throw new Error('Elige una categoria.')

        const expense: Expense = {
          id: makeId('exp'),
          amount,
          categoryId: input.categoryId,
          description: (input.description ?? '').trim(),
          date: input.date || todayISO(),
          createdAt: Date.now(),
        }

        set((state) => ({
          expenses: [...state.expenses, expense],
          reactionTick: state.reactionTick + 1,
        }))
        return expense
      },

      updateExpense: (id, patch) => {
        set((state) => ({
          expenses: state.expenses.map((e) => {
            if (e.id !== id) return e
            const next: Expense = { ...e }
            if (patch.amount !== undefined) next.amount = normalizeAmount(patch.amount)
            if (patch.categoryId !== undefined) next.categoryId = patch.categoryId
            if (patch.description !== undefined) next.description = patch.description.trim()
            if (patch.date !== undefined) next.date = patch.date
            return next
          }),
        }))
      },

      deleteExpense: (id) => {
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }))
      },

      addCategory: (input) => {
        const trimmed = input.name.trim()
        if (!trimmed) throw new Error('El nombre de la categoria no puede estar vacio.')

        const existing = get().categories
        let id = slugify(trimmed)
        let suffix = 1
        while (existing.some((c) => c.id === id)) {
          id = `${slugify(trimmed)}-${suffix++}`
        }

        const category: Category = {
          id,
          name: trimmed,
          icon: input.icon || '🐾',
          color: input.color || CATEGORY_COLOR_PALETTE[existing.length % CATEGORY_COLOR_PALETTE.length],
          isDefault: false,
        }

        set((state) => ({ categories: [...state.categories, category] }))
        return category
      },

      deleteCategory: (id) => {
        const target = get().categories.find((c) => c.id === id)
        if (!target || target.isDefault) return

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          expenses: state.expenses.map((e) => (e.categoryId === id ? { ...e, categoryId: 'otros' } : e)),
        }))
      },

      setMonthlyLimit: (value) => {
        if (value !== null && (!Number.isFinite(value) || value < 0)) {
          throw new Error('Ingresa un presupuesto valido.')
        }
        set({ budget: { monthlyLimit: value } })
      },

      setTheme: (theme) => set((state) => ({ settings: { ...state.settings, theme } })),
      toggleTheme: () =>
        set((state) => ({
          settings: { ...state.settings, theme: state.settings.theme === 'dark' ? 'light' : 'dark' },
        })),
      toggleSound: () =>
        set((state) => ({ settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled } })),
      setCurrency: (code) => set((state) => ({ settings: { ...state.settings, currency: code } })),
      chooseSoundPreference: (enabled) =>
        set((state) => ({ settings: { ...state.settings, soundEnabled: enabled, hasChosenSound: true } })),
    }),
    {
      name: 'gastitos-kawaii-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<{ settings: Partial<Settings> }>
        return { ...p, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) } }
      },
      partialize: (state) => ({
        expenses: state.expenses,
        categories: state.categories,
        budget: state.budget,
        settings: state.settings,
      }),
    }
  )
)
