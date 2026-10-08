import bgCurtain from '@/assets/bg-curtain.jpg'
import bgCurtainV2 from '@/assets/bg-curtain-v2.jpg'

/**
 * Base stage backdrop only — the AI-generated deep crimson velvet curtain
 * with the heart-shaped pink spotlight radiating from bottom-center.
 * Stretched to fully cover the viewport (object-fill) so it adapts to hotel
 * large screens of any aspect ratio. Sits at the back (-z-10). The white
 * line-art frame lives in its own <FrameOverlay /> layer on top.
 *
 * NOTE: 目前临时切到 v2 (无水印版本) 供用户对比预览, 待用户确认后保留
 * 对应版本并删除另一个文件. 切回只需把 USE_V2 改为 false.
 */
const USE_V2 = true
const bgSrc = USE_V2 ? bgCurtainV2 : bgCurtain

export function StageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img
        src={bgSrc}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-fill object-center"
      />
      {/* Color grade + darken edges so foreground UI stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />
    </div>
  )
}
