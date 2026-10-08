import confetti from 'canvas-confetti'
import { useEffect } from 'react'

const COLORS = [
  '#fbbf24',
  '#f43f5e',
  '#ec4899',
  '#a855f7',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#ffffff',
]

/**
 * 全屏彩带烟花喷发: 翻牌瞬间从屏幕底部中央 + 左右两侧 + 空中多点
 * 持续喷射, 使用 canvas-confetti (canvas 渲染, 性能远优于 DOM 动画,
 * 粒子受真实物理引擎驱动自然铺开). 4 秒持续播完后自动停止, 不拦截点击.
 *
 * 时间线:
 *  0ms   底部大礼炮 (宽扇形, 100 粒子)
 *  200ms 底部补射 (80 粒子)
 *  300ms 左右侧礼炮
 *  400ms 底部补射 (60 粒子)
 *  500-2100ms 空中烟花 5 朵 (错开绽放, 全方位扩散)
 *  700ms 左右侧补射
 *  1500/2500/3500ms 底部渐弱补射 (延长持续感)
 */
export function FullScreenBurst() {
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    /** 底部中央礼炮: 宽扇形向上喷射 */
    const bottomCannon = (delay: number, count: number, spread: number) => {
      const t = setTimeout(() => {
        confetti({
          particleCount: count,
          spread,
          origin: { y: 1 },
          colors: COLORS,
          startVelocity: 48,
          scalar: 1.4,
          ticks: 320,
          disableForReducedMotion: true,
        })
      }, delay)
      timers.push(t)
    }

    /** 左/右侧礼炮: 从屏幕两侧下方向斜上方喷射 */
    const sideCannon = (delay: number, side: 'left' | 'right') => {
      const t = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: side === 'left' ? 60 : 120,
          spread: 75,
          origin: { x: side === 'left' ? 0 : 1, y: 0.7 },
          colors: COLORS,
          startVelocity: 42,
          scalar: 1.3,
          ticks: 280,
          disableForReducedMotion: true,
        })
      }, delay)
      timers.push(t)
    }

    /** 空中烟花: 在屏幕上半区随机位置全方位绽放 */
    const firework = (delay: number) => {
      const t = setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 360,
          startVelocity: 35,
          origin: {
            x: 0.15 + Math.random() * 0.7,
            y: 0.2 + Math.random() * 0.4,
          },
          colors: COLORS,
          scalar: 1.2,
          ticks: 240,
          disableForReducedMotion: true,
        })
      }, delay)
      timers.push(t)
    }

    // --- 放映时间线 ---
    bottomCannon(0, 100, 100)
    bottomCannon(200, 80, 90)
    sideCannon(300, 'left')
    sideCannon(300, 'right')
    bottomCannon(400, 60, 80)
    firework(500)
    sideCannon(700, 'left')
    sideCannon(700, 'right')
    firework(900)
    firework(1300)
    bottomCannon(1500, 50, 70)
    firework(1700)
    firework(2100)
    bottomCannon(2500, 40, 60)
    bottomCannon(3500, 30, 50)

    return () => {
      timers.forEach((t) => {
        clearTimeout(t)
      })
      confetti.reset()
    }
  }, [])

  // canvas-confetti 自管理 canvas (fixed inset-0, pointer-events-none,
  // z-index 100), 组件本身不渲染 DOM, 只负责按时间线触发礼炮
  return null
}
