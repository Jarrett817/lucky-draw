import { cn } from '@/lib/utils'

interface LeafSproutProps {
  className?: string
}

/**
 * The small two-leaf sprout emblem that appears next to the slogan on a few
 * cards in the reference design (休息,休息一下 and 香气魔法 启动!).
 * Drawn as a white SVG sprout — a stem with two leaves — so it tints with
 * `currentColor` and stays crisp at any size.
 */
export function LeafSprout({ className }: LeafSproutProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn('h-4 w-4', className)}
    >
      {/* stem */}
      <path
        d="M12 21C12 15 12 11 12 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* left leaf */}
      <path
        d="M12 12C9 11 6 9 6 5.5c3.5 0 6 2 6 6.5Z"
        fill="currentColor"
        fillOpacity="0.9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* right leaf */}
      <path
        d="M12 10C15 9 18 7 18 3.5c-3.5 0-6 2-6 6.5Z"
        fill="currentColor"
        fillOpacity="0.9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
