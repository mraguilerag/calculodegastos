import { supabase } from './supabaseClient'
import type { Budget, Category, Expense, Settings } from '../types'

function requireClient() {
  if (!supabase) throw new Error('Supabase no esta configurado (falta .env.local).')
  return supabase
}

function mapCategoryRow(row: {
  id: string
  name: string
  icon: string
  color: string
  is_default: boolean
}): Category {
  return { id: row.id, name: row.name, icon: row.icon, color: row.color, isDefault: row.is_default }
}

function mapExpenseRow(row: {
  id: string
  category_id: string | null
  amount: number | string
  description: string
  expense_date: string
  created_at: string
}): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    categoryId: row.category_id,
    description: row.description,
    date: row.expense_date,
    createdAt: new Date(row.created_at).getTime(),
  }
}

export interface CloudData {
  expenses: Expense[]
  categories: Category[]
  budget: Budget
  settings: Pick<Settings, 'theme' | 'soundEnabled' | 'currency'>
  /** null si la persona todavia no eligio un nombre para mostrar. */
  profileName: string | null
}

export async function fetchCloudData(userId: string): Promise<CloudData> {
  const client = requireClient()

  const [categoriesRes, expensesRes, profileRes] = await Promise.all([
    client.from('categories').select('*').eq('user_id', userId).order('created_at'),
    client.from('expenses').select('*').eq('user_id', userId).order('expense_date', { ascending: false }),
    client.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
  ])

  if (categoriesRes.error) throw categoriesRes.error
  if (expensesRes.error) throw expensesRes.error
  if (profileRes.error) throw profileRes.error

  return {
    categories: categoriesRes.data.map(mapCategoryRow),
    expenses: expensesRes.data.map(mapExpenseRow),
    budget: { monthlyLimit: profileRes.data?.monthly_limit ?? null },
    settings: {
      theme: (profileRes.data?.theme as Settings['theme']) ?? 'light',
      soundEnabled: profileRes.data?.sound_enabled ?? true,
      currency: profileRes.data?.currency ?? 'USD',
    },
    profileName: profileRes.data?.name ?? null,
  }
}

export async function insertExpenseRow(
  userId: string,
  input: { amount: number; categoryId: string | null; description: string; date: string }
): Promise<Expense> {
  const client = requireClient()
  const { data, error } = await client
    .from('expenses')
    .insert({
      user_id: userId,
      category_id: input.categoryId,
      amount: input.amount,
      description: input.description,
      expense_date: input.date,
    })
    .select()
    .single()
  if (error) throw error
  return mapExpenseRow(data)
}

export async function updateExpenseRow(
  id: string,
  patch: Partial<{ amount: number; categoryId: string | null; description: string; date: string }>
): Promise<void> {
  const client = requireClient()
  const dbPatch: Record<string, unknown> = {}
  if (patch.amount !== undefined) dbPatch.amount = patch.amount
  if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId
  if (patch.description !== undefined) dbPatch.description = patch.description
  if (patch.date !== undefined) dbPatch.expense_date = patch.date

  const { error } = await client.from('expenses').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function deleteExpenseRow(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('expenses').delete().eq('id', id)
  if (error) throw error
}

export async function insertCategoryRow(
  userId: string,
  input: { name: string; icon: string; color: string }
): Promise<Category> {
  const client = requireClient()
  const { data, error } = await client
    .from('categories')
    .insert({ user_id: userId, name: input.name, icon: input.icon, color: input.color, is_default: false })
    .select()
    .single()
  if (error) throw error
  return mapCategoryRow(data)
}

export async function updateCategoryRow(
  id: string,
  patch: Partial<{ name: string; icon: string; color: string }>
): Promise<void> {
  const client = requireClient()
  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.icon !== undefined) dbPatch.icon = patch.icon
  if (patch.color !== undefined) dbPatch.color = patch.color
  if (Object.keys(dbPatch).length === 0) return

  const { error } = await client.from('categories').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function deleteCategoryRow(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('categories').delete().eq('id', id)
  if (error) throw error
}

/** Borra todos los gastos, categorias y el perfil de la cuenta (irreversible). */
export async function deleteAllUserData(userId: string): Promise<void> {
  const client = requireClient()
  const { error: expensesError } = await client.from('expenses').delete().eq('user_id', userId)
  if (expensesError) throw expensesError
  const { error: categoriesError } = await client.from('categories').delete().eq('user_id', userId)
  if (categoriesError) throw categoriesError
  const { error: profileError } = await client.from('profiles').delete().eq('user_id', userId)
  if (profileError) throw profileError
}

export async function reassignExpensesCategory(userId: string, fromCategoryId: string, toCategoryId: string) {
  const client = requireClient()
  const { error } = await client
    .from('expenses')
    .update({ category_id: toCategoryId })
    .eq('user_id', userId)
    .eq('category_id', fromCategoryId)
  if (error) throw error
}

export async function updateProfileRow(
  userId: string,
  patch: Partial<{
    monthlyLimit: number | null
    theme: Settings['theme']
    soundEnabled: boolean
    currency: string
    name: string
  }>
): Promise<void> {
  const client = requireClient()
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.monthlyLimit !== undefined) dbPatch.monthly_limit = patch.monthlyLimit
  if (patch.theme !== undefined) dbPatch.theme = patch.theme
  if (patch.soundEnabled !== undefined) dbPatch.sound_enabled = patch.soundEnabled
  if (patch.currency !== undefined) dbPatch.currency = patch.currency
  if (patch.name !== undefined) dbPatch.name = patch.name

  const { error } = await client.from('profiles').upsert({ user_id: userId, ...dbPatch })
  if (error) throw error
}

/**
 * Sube los gastos y categorias personalizadas que existian en modo local a la
 * cuenta recien creada. Las categorias por defecto ya existen en la nube
 * (las crea el trigger de la base de datos al registrarse), asi que se
 * emparejan por nombre en vez de duplicarlas.
 */
export async function migrateLocalDataToCloud(
  userId: string,
  localExpenses: Expense[],
  localCategories: Category[],
  localBudget: Budget,
  localSettings: Pick<Settings, 'theme' | 'soundEnabled' | 'currency'>
): Promise<number> {
  if (localExpenses.length === 0 && localCategories.every((c) => c.isDefault)) {
    // nada que migrar mas que preferencias
    await updateProfileRow(userId, {
      monthlyLimit: localBudget.monthlyLimit,
      theme: localSettings.theme,
      soundEnabled: localSettings.soundEnabled,
      currency: localSettings.currency,
    })
    return 0
  }

  const client = requireClient()
  const { data: cloudCategories, error: catError } = await client
    .from('categories')
    .select('*')
    .eq('user_id', userId)
  if (catError) throw catError

  const cloudByName = new Map(cloudCategories.map((c) => [c.name.toLowerCase(), c.id as string]))
  const localIdToCloudId = new Map<string, string>()

  for (const cat of localCategories) {
    const existing = cloudByName.get(cat.name.toLowerCase())
    if (existing) {
      localIdToCloudId.set(cat.id, existing)
      continue
    }
    const created = await insertCategoryRow(userId, { name: cat.name, icon: cat.icon, color: cat.color })
    localIdToCloudId.set(cat.id, created.id)
  }

  const fallbackCategoryId = cloudByName.get('otros') ?? cloudCategories[0]?.id
  if (localExpenses.length > 0) {
    const rows = localExpenses.map((e) => ({
      user_id: userId,
      category_id: e.categoryId === null ? null : localIdToCloudId.get(e.categoryId) ?? fallbackCategoryId,
      amount: e.amount,
      description: e.description,
      expense_date: e.date,
    }))
    const { error: insertError } = await client.from('expenses').insert(rows)
    if (insertError) throw insertError
  }

  await updateProfileRow(userId, {
    monthlyLimit: localBudget.monthlyLimit,
    theme: localSettings.theme,
    soundEnabled: localSettings.soundEnabled,
    currency: localSettings.currency,
  })

  return localExpenses.length
}
