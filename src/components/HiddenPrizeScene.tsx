import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { ChevronLeft, Wind } from 'lucide-react'
import { useEffect } from 'react'
import { HIDDEN_PRIZE } from '@/data/prizes'

interface HiddenPrizeSceneProps {
  onBack: () => void
}

/** 终极大奖的金色调色板 (金色 + 玫瑰 + 白) */
const GOLD_COLORS = [
  '#fbbf24',
  '#f59e0b',
  '#f97316',
  '#fde68a',
  '#fca5a5',
  '#fbcfe8',
  '#ffffff',
  '#fcd34d',
]

/**
 * 终极大奖彩蛋页面: 解锁后从底部 + 两侧 + 空中多点持续喷发金色
 * 彩带烟花 (比普通翻牌更盛大: 粒子更多、持续更长、金色调),
 * 加上全屏金色闪光 + 放大脉冲. canvas-confetti 渲染, 不拦截点击.
 */
function fireGrandBurst() {
  const timers: ReturnType<typeof setTimeout>[] = []

  const fire = (opts: confetti.Options) => {
    confetti({ ...opts, colors: GOLD_COLORS, disableForReducedMotion: true })
  }

  // 底部大礼炮 — 连发 4 轮, 每轮渐弱
  const bottomCannon = (delay: number, count: number, spread: number) => {
    const t = setTimeout(() => {
      fire({
        particleCount: count,
        spread,
        origin: { y: 1 },
        startVelocity: 52,
        scalar: 1.5,
        ticks: 400,
      })
    }, delay)
    timers.push(t)
  }

  // 左右两侧礼炮
  const sideCannon = (delay: number, side: 'left' | 'right') => {
    const t = setTimeout(() => {
      fire({
        particleCount: 60,
        angle: side === 'left' ? 60 : 120,
        spread: 80,
        origin: { x: side === 'left' ? 0 : 1, y: 0.7 },
        startVelocity: 45,
        scalar: 1.4,
        ticks: 350,
      })
    }, delay)
    timers.push(t)
  }

  // 空中烟花 — 7 朵, 比普通翻牌多 2 朵
  const firework = (delay: number) => {
    const t = setTimeout(() => {
      fire({
        particleCount: 80,
        spread: 360,
        startVelocity: 40,
        origin: {
          x: 0.1 + Math.random() * 0.8,
          y: 0.15 + Math.random() * 0.45,
        },
        scalar: 1.3,
        ticks: 300,
      })
    }, delay)
    timers.push(t)
  }

  // --- 放映时间线 (6 秒盛大演出) ---
  bottomCannon(0, 140, 110)
  bottomCannon(250, 120, 100)
  sideCannon(400, 'left')
  sideCannon(400, 'right')
  bottomCannon(500, 100, 90)
  firework(600)
  sideCannon(900, 'left')
  sideCannon(900, 'right')
  firework(1100)
  firework(1500)
  bottomCannon(1700, 80, 80)
  firework(1900)
  firework(2300)
  sideCannon(2500, 'left')
  sideCannon(2500, 'right')
  bottomCannon(2800, 60, 70)
  firework(3100)
  firework(3500)
  bottomCannon(3800, 50, 60)
  firework(4200)
  bottomCannon(4600, 40, 50)

  return () => {
    timers.forEach((t) => {
      clearTimeout(t)
    })
    confetti.reset()
  }
}

/**
 * 终极大奖彩蛋页面 (徕芬吹风机). 集齐 12 张卡片后解锁.
 * 电影级揭示: 金色聚光灯收紧 → 卡片 3D 翻入 → 全屏金色闪光 +
 * 盛大彩带烟花 (6 秒, 底部+两侧+空中多点, 金色调).
 */
export function HiddenPrizeScene({ onBack }: HiddenPrizeSceneProps) {
  const [from, to] = HIDDEN_PRIZE.gradient

  useEffect(() => fireGrandBurst(), [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-6 py-12"
    >
      {/* 全屏金色闪光: 入场瞬间一次强闪 */}
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,215,0,0.6) 0%, transparent 60%)',
        }}
      />

      {/* Tighter spotlight for the final reveal */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="animate-spotlight pointer-events-none absolute left-1/2 top-1/2 h-[90vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-[100%] blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,215,120,0.55) 0%, rgba(255,95,162,0.25) 40%, transparent 70%)',
        }}
      />

      <motion.button
        type="button"
        onClick={onBack}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-sm text-white/90 backdrop-blur transition-colors hover:bg-black/60"
      >
        <ChevronLeft className="h-4 w-4" />
        回到抽奖台
      </motion.button>

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{
          type: 'spring',
          stiffness: 90,
          damping: 14,
          delay: 0.3,
        }}
        className="relative mx-auto w-[min(94vw,30rem)] overflow-hidden rounded-3xl border border-white/15 p-8 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
        style={{
          background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
        }}
      >
        <div className="relative mx-auto my-6 mt-2 flex h-28 w-28 items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, 4, -4, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-white/30 blur-2xl"
          />
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 12,
              delay: 0.5,
            }}
            className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl"
          >
            <Wind className="h-14 w-14 text-[#7c2d12]" strokeWidth={1.4} />
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="font-display text-4xl font-bold text-white drop-shadow-lg"
        >
          {HIDDEN_PRIZE.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15 }}
          className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/90"
        >
          {HIDDEN_PRIZE.blessing}
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
