import type { Category } from '../types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'comida', name: 'Comida', icon: '🍙', color: '#ff9eb5', isDefault: true },
  { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#b7a3f0', isDefault: true },
  { id: 'ocio', name: 'Ocio', icon: '🎬', color: '#f3c766', isDefault: true },
  { id: 'salud', name: 'Salud', icon: '💊', color: '#8fd6c8', isDefault: true },
  { id: 'hogar', name: 'Hogar', icon: '🏠', color: '#f0a8d0', isDefault: true },
  { id: 'otros', name: 'Otros', icon: '🏷️', color: '#c9b8a8', isDefault: true },
]

export const CATEGORY_COLOR_PALETTE = [
  '#ff9eb5',
  '#b7a3f0',
  '#f3c766',
  '#8fd6c8',
  '#f0a8d0',
  '#f26ba8',
  '#a1c9f4',
  '#e0a838',
]
