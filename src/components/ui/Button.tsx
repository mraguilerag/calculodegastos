import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { sound } from '../../lib/sound'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>

interface ButtonProps extends NativeButtonProps {
  children: ReactNode
  variant?: Variant
  icon?: ReactNode
  onClick?: () => void
  silent?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-[var(--shadow-glass)] hover:shadow-[var(--shadow-glass-lg)]',
  secondary:
    'bg-white/70 dark:bg-night-700/70 text-ink-700 dark:text-pink-100 border border-white/70 dark:border-white/10 hover:border-pink-300',
  ghost: 'bg-transparent text-ink-500 dark:text-pink-200/80 hover:bg-pink-100/60 dark:hover:bg-white/5',
  danger: 'bg-white/70 dark:bg-night-700/70 text-rose-600 dark:text-rose-300 border border-rose-200/70 hover:bg-rose-50 dark:hover:bg-rose-950/30',
}

export function Button({
  children,
  variant = 'primary',
  icon,
  onClick,
  silent = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      onClick={() => {
        if (!silent) sound.click()
        onClick?.()
      }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5',
        'font-heading font-semibold text-sm tracking-wide',
        'transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  )
}
