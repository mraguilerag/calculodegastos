interface IconRule {
  icon: string
  keywords: string[]
}

const ICON_RULES: IconRule[] = [
  {
    icon: '🍔',
    keywords: [
      'comida', 'food', 'delivery', 'restaurant', 'restaurante', 'cafe', 'almuerzo', 'cena',
      'desayuno', 'super', 'supermercado', 'mercado', 'grocery', 'snack',
    ],
  },
  {
    icon: '🚗',
    keywords: [
      'transporte', 'auto', 'carro', 'coche', 'uber', 'taxi', 'gas', 'gasolina', 'combustible',
      'bus', 'metro', 'tren', 'estacionamiento', 'peaje',
    ],
  },
  { icon: '🐾', keywords: ['mascota', 'perro', 'gato', 'pet', 'veterinario', 'veterinaria'] },
  { icon: '👗', keywords: ['ropa', 'moda', 'clothes', 'zapatos', 'shoes', 'vestimenta'] },
  {
    icon: '💊',
    keywords: ['salud', 'doctor', 'medico', 'medicina', 'farmacia', 'hospital', 'dentista'],
  },
  {
    icon: '🏠',
    keywords: [
      'hogar', 'casa', 'renta', 'alquiler', 'muebles', 'decoracion', 'servicios', 'luz', 'agua',
      'internet',
    ],
  },
  {
    icon: '🎬',
    keywords: [
      'ocio', 'cine', 'pelicula', 'juego', 'videojuego', 'streaming', 'netflix', 'entretenimiento',
      'diversion',
    ],
  },
  { icon: '📚', keywords: ['educacion', 'curso', 'colegio', 'universidad', 'libro', 'libros', 'escuela'] },
  { icon: '✈️', keywords: ['viaje', 'vacaciones', 'hotel', 'vuelo', 'avion'] },
  {
    icon: '💻',
    keywords: ['tecnologia', 'celular', 'telefono', 'computadora', 'laptop', 'electronica'],
  },
  { icon: '💅', keywords: ['belleza', 'spa', 'salon', 'peluqueria', 'manicure'] },
  { icon: '🎁', keywords: ['regalo', 'cumpleanos', 'gift', 'navidad'] },
  { icon: '💰', keywords: ['ahorro', 'inversion', 'banco', 'deuda', 'prestamo'] },
  { icon: '🏋️', keywords: ['gym', 'gimnasio', 'deporte', 'fitness', 'ejercicio'] },
  { icon: '👶', keywords: ['bebe', 'nino', 'ninos', 'hijo', 'hijos', 'panales'] },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Sugiere un icono coherente segun palabras clave en el nombre; null si no hay coincidencia. */
export function suggestIcon(name: string): string | null {
  const normalized = normalize(name)
  if (!normalized) return null
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) {
      return rule.icon
    }
  }
  return null
}

/** Grilla de iconos para elegir manualmente cuando no hay sugerencia (o para cambiarla). */
export const CATEGORY_ICON_OPTIONS = [
  '🍔', '🚗', '🐾', '👗', '💊', '🏠', '🎬', '📚', '✈️', '💻', '💅', '🎁',
  '💰', '🏋️', '👶', '🎓', '🎵', '📱', '🛒', '⚡', '🍺', '🎮', '🧾', '🏷️',
]
