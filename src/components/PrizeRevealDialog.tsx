import { motion } from 'framer-motion'
import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Prize } from '@/data/prizes'

interface PrizeRevealDialogProps {
  prize: Prize | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** called once when the dialog first opens for this prize — drives the
   *  persisted "revealed" state so it counts even if the user refreshes
   *  without closing */
  onConfirmReveal: (prize: Prize) => void
}

/**
 * The reveal dialog shown after tapping a card. Three beats:
 *   1. A "sealed" gold envelope scales in with a "?" mark
 *   2. It bursts open (scale + rotate + fade), confetti fires
 *   3. The actual prize (icon + name + blessing) springs in from the centre
 * A "拆开" (open) button drives beat 1→2 so the user has the tactile moment
 * of "opening" the gift; closing the dialog is always available via X / Esc /
 * backdrop. The first-open moment auto-confirms the reveal state.
 */
export function PrizeRevealDialog({
  prize,
  open,
  onOpenChange,
  onConfirmReveal,
}: PrizeRevealDialogProps) {
  // Confirm the reveal the moment the dialog mounts for this prize so progress
  // is persisted even if the user refreshes without explicitly closing.
  // Fires once per open: prize only changes when a new card is clicked, and
  // onConfirmReveal (a Set-based upsert) is idempotent so repeat calls are safe.
  useEffect(() => {
    if (open && prize) onConfirmReveal(prize)
  }, [open, prize, onConfirmReveal])

  if (!prize) return null
  const Icon = prize.icon
  const [from, to] = prize.gradient

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="w-[min(94vw,40rem)] overflow-hidden rounded-3xl border-0 bg-transparent p-0 shadow-2xl"
      >
        <DialogTitle className="sr-only">{prize.name}</DialogTitle>
        <DialogDescription className="sr-only">
          {prize.blessing}
        </DialogDescription>

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          className="relative w-full overflow-hidden rounded-3xl border border-white/15 p-10 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          style={{
            background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
          }}
        >
          {/* Glow ring behind icon */}
          <div className="relative mx-auto mb-6 mt-2 flex h-32 w-32 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,0.7), transparent 70%)`,
              }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 14,
                delay: 0.1,
              }}
              className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white/95 shadow-lg"
            >
              <Icon
                className="h-16 w-16"
                style={{ color: from }}
                strokeWidth={1.6}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative"
          >
            <p className="font-display text-base tracking-[0.2em] text-white/80">
              恭喜解锁 · {prize.slogan}
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white drop-shadow sm:text-5xl">
              {prize.name}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/90">
              {prize.blessing}
            </p>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
