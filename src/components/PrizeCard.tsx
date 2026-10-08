import { motion } from 'framer-motion'
import type { Prize } from '@/data/prizes'
import { cn } from '@/lib/utils'
import { CornerBracket } from './CornerBracket'
import { LeafSprout } from './LeafSprout'

interface PrizeCardProps {
  prize: Prize
  revealed: boolean
  index: number
  onReveal: (prize: Prize) => void
}

/**
 * One card in the 3x4 grid.
 *  - 未揭晓: 粉色背景 + 白色边框/角括号 + 口号 (Ma Shan Zheng 刷体) + 叶子,
 *    整张卡片规律上下浮动 + 放大缩小 (外层 wrapper 承载, 避开 button transform).
 *  - 已揭晓: 白色背景 + 奖品图标 + 名称, 静止无动效, 点击无效 (disabled).
 *    以背景色 + 有无动效区分两种状态, 一眼可辨.
 */
export function PrizeCard({
  prize,
  revealed,
  index,
  onReveal,
}: PrizeCardProps) {
  const leaves = prize.leaves ?? 0
  const Icon = prize.icon
  // 叶子只在未揭晓(粉色)卡片上出现, 用深红色配粉色背景
  const leafColor = 'text-[#7a1330]'
  // 两行口号用更小字号, 避免在限高卡片里被裁切
  const twoLine = Boolean(prize.sloganLine2)
  const sloganFont = twoLine ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'

  return (
    // 外层呼吸容器: 未揭晓时整张卡片规律上下浮动 + 放大缩小.
    // 已揭晓回到静止 { y: 0, scale: 1 }, 无任何动效.
    // 每张卡片时长按 index 错开, 避免同步起伏显得机械.
    <motion.div
      className="h-full w-full"
      animate={
        revealed ? { y: 0, scale: 1 } : { y: [0, -5, 0], scale: [1, 1.04, 1] }
      }
      transition={
        revealed
          ? { duration: 0.3 }
          : {
              duration: 3.2 + (index % 4) * 0.18,
              repeat: Infinity,
              ease: 'easeInOut',
            }
      }
    >
      <motion.button
        type="button"
        disabled={revealed}
        onClick={() => onReveal(prize)}
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: 0.05 * index,
          type: 'spring',
          stiffness: 120,
          damping: 14,
        }}
        whileHover={revealed ? undefined : { y: -4, scale: 1.03 }}
        whileTap={revealed ? undefined : { scale: 0.97 }}
        className={cn(
          'group relative h-full w-full overflow-hidden rounded-2xl border-[3px] border-white/95 p-3 text-left shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2a0608]',
          'disabled:cursor-default disabled:opacity-100',
          revealed
            ? 'bg-gradient-to-br from-white via-white to-[#fff4f6] text-[#2a0608]'
            : 'bg-gradient-to-br from-[#ffd9e6] via-[#ffc2d4] to-[#ff9ec1] text-[#3a0a1f]',
        )}
      >
        {/* White vine-tendril corner brackets on all four corners
            (粉色背景上可见, 白色已揭晓卡片上自然隐入背景) */}
        <CornerBracket
          corner="tl"
          className="absolute left-1.5 top-1.5 text-white"
        />
        <CornerBracket
          corner="tr"
          className="absolute right-1.5 top-1.5 text-white"
        />
        <CornerBracket
          corner="bl"
          className="absolute bottom-1.5 left-1.5 text-white"
        />
        <CornerBracket
          corner="br"
          className="absolute bottom-1.5 right-1.5 text-white"
        />

        {revealed ? (
          // 已揭晓: 直接显示奖品图标 + 名称, 静止无动效, 文字图标变灰
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center text-zinc-400">
            <Icon
              className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
              strokeWidth={1.6}
            />
            <span className="font-display text-lg leading-tight drop-shadow-sm sm:text-xl">
              {prize.name}
            </span>
          </div>
        ) : (
          // 未揭晓: 口号 + 可选叶子
          <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-center">
            <div className="flex items-center justify-center gap-2">
              {leaves >= 1 && (
                <LeafSprout className={cn('h-5 w-5 shrink-0', leafColor)} />
              )}
              <span
                className={cn(
                  'text-shimmer font-display leading-tight drop-shadow-sm',
                  sloganFont,
                )}
              >
                {prize.slogan}
              </span>
              {leaves >= 2 && (
                <LeafSprout className={cn('h-5 w-5 shrink-0', leafColor)} />
              )}
            </div>
            {prize.sloganLine2 && (
              <span
                className={cn(
                  'text-shimmer font-display leading-tight drop-shadow-sm',
                  sloganFont,
                )}
              >
                {prize.sloganLine2}
              </span>
            )}
          </div>
        )}

        {/* Shimmer sweep on unopened cards to hint they're tappable */}
        {!revealed && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
              backgroundSize: '250% 100%',
              animation: 'shimmer 2.5s linear infinite',
            }}
          />
        )}
      </motion.button>
    </motion.div>
  )
}
