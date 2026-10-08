import type { CSSProperties } from 'react'
import frameOverlay from '@/assets/frame-overlay.jpg'

/**
 * The white hand-drawn line-art frame + circus ornaments, keyed via a
 * luminance mask instead of mix-blend-mode.
 *
 * The source JPG ships on a pure-black background with bright-white line
 * art. A luminance mask turns the image's own brightness into alpha —
 * bright (white lines/ornaments) → opaque, dark (black interior) → fully
 * transparent — so only the white line work shows over the curtain, with no
 * dependence on stacking context (mix-blend-mode breaks when transforms /
 * opacity / fixed layers create intermediate stacking contexts).
 *
 * The mask lives in the `.frame-mask` CSS class (see index.css) because
 * mask-mode MUST be set explicitly to `luminance` — without it, browsers
 * default to alpha mode, and since a JPG has no alpha channel the whole
 * image is treated as an opaque mask, flooding the screen white. React's
 * CSSProperties type also doesn't include the webkit mask-mode variant, so
 * the class is the right place. We only pass the asset URL inline via the
 * `--frame-url` CSS variable.
 *
 * Layering: fixed, above cards (z-50), `pointer-events-none` so clicks pass
 * straight through to the cards below. Stays fixed while the card grid
 * scrolls within the frame interior.
 */
export function FrameOverlay() {
  const style = {
    '--frame-url': `url(${frameOverlay})`,
    opacity: 0.92,
  } as CSSProperties
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="frame-mask absolute inset-0 bg-white" style={style} />
    </div>
  )
}
