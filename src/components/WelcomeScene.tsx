import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import stickerCupid from '@/assets/sticker-cupid.png'
import stickerLogo from '@/assets/sticker-logo.png'
import userAvatar from '@/assets/user-avatar.png'
import stickerCake from '@/assets/sticker-cake.png'
import stickerCatBrown from '@/assets/sticker-cat-brown.png'
import stickerCatGray from '@/assets/sticker-cat-gray.png'
import { StarCanvas } from '@/components/StarCanvas'

/**
 * 婚礼欢迎页 — 按参考图1布局 1:1 还原:
 *  深红幕布 + 心形聚光灯 + 白色线框 (复用 StageBackground / FrameOverlay)
 *
 *  布局 (百分比 = 参考图坐标):
 *    蛋糕     左上 (14%, 20%)
 *    丘比特   右上 (82%, 22%)
 *    灰白猫   左下 (15%, 68%)
 *    棕白猫   右下 (80%, 68%)
 *    文字组   中央: "Welcome to" / W&L's carnival logo(可点击) / 中文
 *    头像     底部中央 (两猫之间)
 *
 *  Canvas 星空: 闪烁星 / 飘落星 / 流星 / 漂浮爱心
 *  动效: 猫头摇摆 / 丘比特浮动 / 蛋糕呼吸 / logo呼吸 / 头像呼吸
 *  点击 logo 进入抽奖主舞台, hover 时出现光环.
 *
 *  蛋糕/灰白猫/棕白猫均为透明 PNG 贴纸, 直接显示无需去白底处理.
 */

interface WelcomeSceneProps {
  onEnter: () => void
}

export function WelcomeScene({ onEnter }: WelcomeSceneProps) {
  return (
    <motion.main
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex h-[100vh] w-full flex-col items-center justify-center overflow-hidden"
    >
      <StarCanvas />

      {/* --- 四角贴纸 (按参考图坐标) --- */}
      {/* 蛋糕 — 左上 */}
      <Sticker
        src={stickerCake}
        alt=""
        className="left-[13%] top-[8%] h-[36vh] w-auto sm:left-[14%] sm:top-[9%] sm:h-[42vh]"
        animation="breathe"
      />
      {/* 丘比特 — 右上 */}
      <Sticker
        src={stickerCupid}
        alt=""
        className="right-[13%] top-[18%] h-[24vh] w-auto sm:right-[14%] sm:top-[19%] sm:h-[28vh]"
        animation="float"
      />
      {/* 灰白猫 — 左下 */}
      <Sticker
        src={stickerCatGray}
        alt=""
        className="bottom-[12%] left-[13%] h-[28vh] w-auto sm:bottom-[13%] sm:left-[14%] sm:h-[32vh]"
        animation="sway"
        swayOrigin="50% 85%"
      />
      {/* 棕白猫 — 右下 */}
      <Sticker
        src={stickerCatBrown}
        alt=""
        className="bottom-[12%] right-[13%] h-[28vh] w-auto sm:bottom-[13%] sm:right-[14%] sm:h-[32vh]"
        animation="sway"
        swayOrigin="50% 85%"
        swayDelay={0.8}
      />

      {/* --- 中央文字组 --- */}
      <div className="relative z-30 flex flex-col items-center px-6 text-center">
        {/* 第一行: "Welcome to" + logo 同行 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center justify-center gap-5"
        >
          <span className="font-carnival text-2xl text-rose-200/90 drop-shadow sm:text-4xl">
            Welcome to
          </span>

          {/* W&L's carnival logo — 可点击进入抽奖 */}
          <motion.button
            type="button"
            onClick={onEnter}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.7, type: 'spring', stiffness: 120 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="cursor-pointer"
            aria-label="进入抽奖"
          >
            <motion.img
              src={stickerLogo}
              alt="W&L's Carnival"
              animate={{ scale: [1, 1.03, 1], y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="h-auto w-[40vw] max-w-[480px] drop-shadow-[0_4px_20px_rgba(244,63,94,0.35)] sm:w-[32vw]"
            />
          </motion.button>
        </motion.div>

        {/* 第二行: 中文, 加大字体 */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="-mt-18 font-display text-4xl text-amber-100/90 drop-shadow sm:text-6xl"
        >
          欢迎参加王俊然和李安妮的婚礼
        </motion.p>

        {/* 头像 — 底部中央 (两猫之间) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-17"
        >
          <motion.img
            src={userAvatar}
            alt="新人头像"
            animate={{ scale: [1, 1.03, 1], y: [0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-auto w-[32vw] max-w-[360px] drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] sm:w-[26vw]"
          />
        </motion.div>
      </div>
    </motion.main>
  )
}

type AnimationType = 'breathe' | 'float' | 'sway'

interface StickerProps {
  src: string
  alt: string
  className: string
  animation: AnimationType
  swayOrigin?: string
  swayDelay?: number
  blendMode?: 'multiply' | 'normal'
}

interface LoopAnim {
  animate: Record<string, number[]>
  transition: {
    duration: number
    repeat: number
    ease: 'easeInOut'
    delay?: number
  }
}

/**
 * 贴纸图容器.
 *  - blendMode='multiply': 白底JPG用 inverse luminance mask 去白底
 *    (CSS .bg-remove 类, 不依赖 stacking context, 动画/transform 不影响)
 *  - blendMode 不设: 透明PNG, 直接显示 (丘比特)
 * 外层 motion.div 负责入场, 内层负责持续循环动效.
 */
function Sticker({ src, alt, className, animation, swayOrigin, swayDelay = 0, blendMode = 'normal' }: StickerProps) {
  const loops: Record<AnimationType, LoopAnim> = {
    breathe: {
      animate: { scale: [1, 1.04, 1] },
      transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
    },
    float: {
      animate: { y: [0, -12, 0], rotate: [0, 3, 0] },
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
    sway: {
      animate: { rotate: [-4, 4, -4] },
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: swayDelay },
    },
  }

  const loop = loops[animation]
  const style: CSSProperties = {
    transformOrigin: swayOrigin ?? 'center center',
  }

  const imgStyle: CSSProperties = blendMode === 'multiply'
    ? { '--img-url': `url(${src})` } as CSSProperties
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`pointer-events-none absolute z-30 ${className}`}
    >
      <motion.div
        animate={loop.animate}
        transition={loop.transition}
        style={style}
        className="h-full w-full"
      >
        <img
          src={src}
          alt={alt}
          aria-hidden
          style={imgStyle}
          className={`h-full w-full object-contain ${blendMode === 'multiply' ? 'bg-remove' : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]'}`}
        />
      </motion.div>
    </motion.div>
  )
}
