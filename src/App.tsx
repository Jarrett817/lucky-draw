import { AnimatePresence, motion } from 'framer-motion'
import { Music, RotateCcw, Star, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  ensureAudioStarted,
  playClick,
  playReveal,
  playUnlock,
  setBgmMuted,
} from '@/audio/sound'
import { FrameOverlay } from '@/components/FrameOverlay'
import { FullScreenBurst } from '@/components/FullScreenBurst'
import { HiddenPrizeScene } from '@/components/HiddenPrizeScene'
import { PrizeCard } from '@/components/PrizeCard'
import { PrizeRevealDialog } from '@/components/PrizeRevealDialog'
import { StageBackground } from '@/components/StageBackground'
import { Button } from '@/components/ui/button'
import { PRIZES, type Prize } from '@/data/prizes'
import { useRevealedPrizes } from '@/hooks/useRevealedPrizes'

type View = 'stage' | 'hidden'

export default function App() {
  const { revealedCount, total, allRevealed, reveal, isRevealed, reset } =
    useRevealedPrizes()

  const [active, setActive] = useState<Prize | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [view, setView] = useState<View>('stage')
  const [bgmMuted, setBgmMutedState] = useState(false)
  // 彩带烟花 key: 翻牌瞬间自增触发, 5.8s 后自动清除 (独立于弹窗状态,
  // 避免弹窗关闭时彩带被一起卸载看不到完整喷发)
  const [burstKey, setBurstKey] = useState<number | null>(null)

  // 浏览器拦截自动播放: 用户首次 pointerdown / keydown 时解锁
  // AudioContext + 构建 BGM 节点并启动循环. 一次性, 之后 SFX / 静音
  // 切换直接走已建好的合成器节点.
  useEffect(() => {
    const unlock = () => {
      ensureAudioStarted()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // 彩带烟花自动退场: 触发后 5.8s 卸载, 刚好覆盖最长彩带的弧线时长
  useEffect(() => {
    if (burstKey === null) return
    const t = setTimeout(() => setBurstKey(null), 5800)
    return () => clearTimeout(t)
  }, [burstKey])

  const handleReveal = useCallback((prize: Prize) => {
    playClick()
    setActive(prize)
    setDialogOpen(true)
    setBurstKey((k) => (k ?? 0) + 1)
  }, [])

  const handleConfirmReveal = useCallback(
    (prize: Prize) => {
      reveal(prize.id)
      playReveal()
    },
    [reveal],
  )

  const handleUnlockHidden = useCallback(() => {
    playUnlock()
    setView('hidden')
  }, [])

  const handleReset = useCallback(() => {
    reset()
    setView('stage')
    setActive(null)
    setBurstKey(null)
  }, [reset])

  const toggleBgm = useCallback(() => {
    const next = !bgmMuted
    setBgmMuted(next)
    setBgmMutedState(next)
  }, [bgmMuted])

  return (
    <div className="relative min-h-[100svh] w-full text-white">
      <StageBackground />
      <FrameOverlay />

      <AnimatePresence mode="wait">
        {view === 'stage' ? (
          <motion.main
            key="stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            // 一屏布局: h-[100svh] + overflow-hidden 杜绝页面级滚动;
            // padding 让标题 / 控制条 / 网格全部落在线框图内部.
            className="relative z-10 flex h-[100svh] flex-col items-center overflow-hidden px-[6vw] pb-[12vh] pt-[12vh]"
          >
            <Title />

            {/* 控制条: 进度 + BGM 静音 + 重置/解锁彩蛋, 全部在线框内部 */}
            <ControlBar
              revealedCount={revealedCount}
              total={total}
              allRevealed={allRevealed}
              bgmMuted={bgmMuted}
              onToggleBgm={toggleBgm}
              onUnlockHidden={handleUnlockHidden}
              onReset={handleReset}
            />

            {/* 卡片网格: 用固定行数 + h-full 让 12 张卡片在一屏内自适应
                填满, 不出现滚动条. overflow-hidden 兜底裁掉呼吸放大溢出. */}
            <div className="mx-auto w-full max-w-6xl min-h-0 flex-1 overflow-hidden">
              <div className="grid h-full w-full grid-cols-2 grid-rows-6 gap-4 px-4 py-2 sm:grid-cols-3 sm:grid-rows-4 sm:gap-6 sm:px-6 md:grid-cols-4 md:grid-rows-3 md:gap-8 md:px-8">
                {PRIZES.map((prize, i) => (
                  <PrizeCard
                    key={prize.id}
                    prize={prize}
                    index={i}
                    revealed={isRevealed(prize.id)}
                    onReveal={handleReveal}
                  />
                ))}
              </div>
            </div>
          </motion.main>
        ) : (
          <motion.main
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HiddenPrizeScene onBack={() => setView('stage')} />
          </motion.main>
        )}
      </AnimatePresence>

      {/* 翻牌瞬间全屏彩带 + 烟花喷发 (独立于弹窗状态, 完整播完 5.8s) */}
      {burstKey !== null && <FullScreenBurst key={burstKey} />}

      <PrizeRevealDialog
        prize={active}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirmReveal={handleConfirmReveal}
      />
    </div>
  )
}

/** 标题: "W&L's Carnival" — 红色手写体嘉年华风格 (Pacifico 字体),
 * 呼应参考图的红色手写刷体. 在线框顶部. */
function Title() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-2 text-center"
    >
      <h1 className="font-carnival text-2xl text-rose-400 drop-shadow-lg sm:text-3xl">
        W&L&apos;s Carnival
      </h1>
    </motion.div>
  )
}

interface ControlBarProps {
  revealedCount: number
  total: number
  allRevealed: boolean
  bgmMuted: boolean
  onToggleBgm: () => void
  onUnlockHidden: () => void
  onReset: () => void
}

function ControlBar({
  revealedCount,
  total,
  allRevealed,
  bgmMuted,
  onToggleBgm,
  onUnlockHidden,
  onReset,
}: ControlBarProps) {
  const pct = Math.round((revealedCount / total) * 100)
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-3 flex w-full max-w-2xl items-center gap-4"
    >
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/15">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-rose-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </div>
      <span className="font-display whitespace-nowrap text-lg text-white/90">
        {revealedCount} / {total}
      </span>

      {/* BGM 静音 / 取消静音 */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleBgm}
        aria-label={bgmMuted ? '取消静音' : '静音'}
        className="h-12 w-12 border-white/30 bg-white/10 text-white hover:bg-white/20"
      >
        {bgmMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Music className="h-5 w-5" />
        )}
      </Button>

      {/* 重置按钮 (已解锁全部时也保留, 方便再来一局) */}
      <Button
        variant="outline"
        size="lg"
        onClick={onReset}
        disabled={revealedCount === 0}
        className="h-12 border-white/30 bg-white/10 text-base text-white hover:bg-white/20"
      >
        <RotateCcw className="h-5 w-5" />
        重置
      </Button>

      {/* 全部揭晓后额外显示解锁彩蛋入口 */}
      {allRevealed && (
        <Button
          size="lg"
          onClick={onUnlockHidden}
          className="h-12 border-0 bg-gradient-to-r from-amber-400 to-rose-500 text-base text-white shadow-lg shadow-rose-500/30 hover:from-amber-300 hover:to-rose-400"
        >
          <Star className="h-5 w-5" />
          解锁彩蛋
        </Button>
      )}
    </motion.div>
  )
}
