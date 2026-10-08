import { useCallback, useEffect, useMemo, useState } from 'react'
import { PRIZES } from '@/data/prizes'

const STORAGE_KEY = 'lucky-draw.revealed.v1'

/**
 * Tracks which prize cards have been opened, persisted to localStorage so a
 * refresh keeps progress. Exposes stable helpers plus a derived `allRevealed`
 * flag used to unlock the hidden 徕芬吹风机 page.
 */
export function useRevealedPrizes() {
  const [revealed, setRevealed] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return new Set()
      const arr = JSON.parse(raw) as string[]
      // Only keep ids that still exist (in case data changes later)
      const valid = new Set(PRIZES.map((p) => p.id))
      return new Set(arr.filter((id) => valid.has(id)))
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(revealed)),
      )
    } catch {
      /* ignore quota / privacy errors */
    }
  }, [revealed])

  const reveal = useCallback((id: string) => {
    setRevealed((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const isRevealed = useCallback((id: string) => revealed.has(id), [revealed])

  const reset = useCallback(() => setRevealed(new Set()), [])

  const allRevealed = useMemo(
    () => PRIZES.every((p) => revealed.has(p.id)),
    [revealed],
  )

  const revealedCount = revealed.size

  return {
    revealed,
    revealedCount,
    total: PRIZES.length,
    allRevealed,
    reveal,
    isRevealed,
    reset,
  }
}
