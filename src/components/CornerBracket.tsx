import { cn } from '@/lib/utils'

interface CornerBracketProps {
  className?: string
  corner?: 'tl' | 'tr' | 'bl' | 'br'
}

/**
 * The ornamental corner flourish seen on every card in the reference design —
 * a small white vine-tendril / scroll mark pointing toward the card centre.
 * One path is drawn for the top-left orientation and rotated 0/90/180/270°
 * to land in the requested corner. Rendered as SVG so it stays crisp.
 */
export function CornerBracket({
  className,
  corner = 'tl',
}: CornerBracketProps) {
  const rotation = { tl: 0, tr: 90, br: 180, bl: 270 }[corner]
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn('h-4 w-4', className)}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* outer L rail */}
      <path
        d="M3 21V6A3 3 0 0 1 6 3H21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* little vine curl hugging the corner */}
      <path
        d="M7 7c2.5 0 4 1.6 4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* leaf dot */}
      <circle cx="9.5" cy="9.5" r="1.1" fill="currentColor" />
    </svg>
  )
}
