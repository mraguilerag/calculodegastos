import { useEffect, useMemo, useState } from 'react'
import { getPeriodRange, formatPeriodLabel, isCurrentPeriod, type Granularity } from '../lib/periods'

export interface PeriodNav {
  granularity: Granularity
  setGranularity: (g: Granularity) => void
  offset: number
  range: ReturnType<typeof getPeriodRange>
  label: string
  isCurrent: boolean
  goPrev: () => void
  goNext: () => void
  goToday: () => void
}

export function usePeriodNav(): PeriodNav {
  const [granularity, setGranularityState] = useState<Granularity>('month')
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setOffset(0)
  }, [granularity])

  const range = useMemo(() => getPeriodRange(granularity, offset), [granularity, offset])
  const label = useMemo(() => formatPeriodLabel(granularity, range), [granularity, range])

  return {
    granularity,
    setGranularity: setGranularityState,
    offset,
    range,
    label,
    isCurrent: isCurrentPeriod(offset),
    goPrev: () => setOffset((o) => o - 1),
    goNext: () => setOffset((o) => Math.min(0, o + 1)),
    goToday: () => setOffset(0),
  }
}
