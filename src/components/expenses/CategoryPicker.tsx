import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { Category } from '../../types'
import { cn } from '../../lib/cn'
import { sound } from '../../lib/sound'

interface CategoryPickerProps {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRequestNew: () => void
}

export function CategoryPicker({ categories, selectedId, onSelect, onRequestNew }: CategoryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Categoria">
      {categories.map((cat) => {
        const active = cat.id === selectedId
        return (
          <motion.button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={active}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              sound.click()
              onSelect(cat.id)
            }}
            style={
              active
                ? ({
                    borderColor: cat.color,
                    backgroundColor: `${cat.color}2e`,
                    boxShadow: `0 0 0 3px ${cat.color}40`,
                  } satisfies CSSProperties)
                : undefined
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-sm font-heading font-medium',
              'transition-all duration-200',
              active
                ? 'text-ink-900 dark:text-pink-50'
                : 'border-transparent bg-white/60 dark:bg-night-700/50 text-ink-700 dark:text-pink-100/80 hover:-translate-y-0.5'
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} aria-hidden />
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </motion.button>
        )
      })}
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          sound.click()
          onRequestNew()
        }}
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-ink-300/60 dark:border-pink-200/30 px-3.5 py-2 text-sm font-heading font-medium text-ink-500 dark:text-pink-200/60 hover:-translate-y-0.5 transition-all duration-200"
      >
        <span aria-hidden>+</span>
        <span>Nueva categoria</span>
      </motion.button>
    </div>
  )
}
