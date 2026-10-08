import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface ConfettiProps {
  /** total ribbon count */
  count?: number
}

const RIBBON_COLORS = [
  '#fbbf24', // 金
  '#f43f5e', // 玫红
  '#ec4899', // 粉
  '#a855f7', // 紫
  '#06b6d4', // 青
  '#84cc16', // 绿
  '#f97316', // 橙
  '#ffffff', // 白
]

/**
 * 彩带喷发: 拆封瞬间从中心向斜上方喷出的长条彩带, 受重力下坠 + 翻滚 + 渐隐.
 * 模拟 party popper / 撒花 的喷发观感, 纯装饰.
 */
export function Confetti({ count = 46 }: ConfettiProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      // 主方向朝上 (party popper), 角度集中在 -150°~-30° (左上→正上→右上)
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95
      const distance = 140 + Math.random() * 240
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance, // 负值 = 向上
        rotate: Math.random() * 1080 - 540,
        delay: Math.random() * 0.12,
        duration: 1.4 + Math.random() * 1.2,
        color: RIBBON_COLORS[Math.floor(Math.random() * RIBBON_COLORS.length)],
        width: 3 + Math.random() * 3, // 3-6px 宽
        height: 18 + Math.random() * 18, // 18-36px 长
      }
    })
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y + 340, // 重力下坠
            rotate: p.rotate,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.16, 1, 0.3, 1],
            opacity: { times: [0, 0.6, 1] },
          }}
          className="absolute rounded-full"
          style={{
            backgroundColor: p.color,
            width: p.width,
            height: p.height,
          }}
        />
      ))}
    </div>
  )
}
