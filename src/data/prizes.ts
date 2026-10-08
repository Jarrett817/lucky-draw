import {
  BatteryCharging,
  BedDouble,
  Boxes,
  CakeSlice,
  Citrus,
  Coins,
  CupSoda,
  Droplets,
  Flower2,
  Gift,
  HeartPulse,
  type LucideIcon,
  Sparkles,
} from 'lucide-react'

export type CardTone = 'white' | 'pink'

export interface Prize {
  /** Stable unique id, persisted in localStorage */
  id: string
  /** The playful slogan shown on the card front (matches design image copy) */
  slogan: string
  /** Optional second line for two-line slogans (bottom-row cards in the
   * reference design stack the slogan onto two lines) */
  sloganLine2?: string
  /** How many small leaf-sprout emblems sit beside the slogan. The reference
   * shows 1 leaf on 休息, 2 leaves on 香气魔法 启动!, 0 elsewhere */
  leaves?: 0 | 1 | 2
  /** The actual prize name revealed in the dialog */
  name: string
  /** Short one-line blessing / description shown under the prize name */
  blessing: string
  /** Lucide icon used on both the revealed card and the dialog */
  icon: LucideIcon
  /** Card background tone, alternating per the original design */
  tone: CardTone
  /** Gradient pair for the prize reveal dialog accent */
  gradient: [string, string]
  /** Emoji used in the confetti burst + small accents */
  emoji: string
}

/**
 * Order matches the user's list and the 3x4 grid in the reference design:
 *  Row 1: 电力满格 / 鲜气满满 / 从头顺到尾 / 温养安康
 *  Row 2: 步步生甜 / 旺气加持 / 带薪吨吨吨喝水! / 休息,休息一下
 *  Row 3: 香气魔法启动! / 未知惊喜 / 秀发生财 / 马上有钱花
 *  Tone alternation per the original layout (row1 white, row2 pink, row3 pink/pink/white/white).
 */
export const PRIZES: Prize[] = [
  {
    id: 'power-bank',
    slogan: '电力满格',
    name: '小米充电宝',
    blessing: '随时回血,满电出发。',
    icon: BatteryCharging,
    tone: 'white',
    gradient: ['#f59e0b', '#ef4444'],
    emoji: '🔋',
  },
  {
    id: 'juicer',
    slogan: '鲜气满满',
    name: '小米榨汁杯',
    blessing: '一口鲜榨,元气上头。',
    icon: Citrus,
    tone: 'white',
    gradient: ['#84cc16', '#f59e0b'],
    emoji: '🍊',
  },
  {
    id: 'massage-comb',
    slogan: '从头顺到尾',
    name: '按摩梳',
    blessing: '梳走疲惫,一路顺到底。',
    icon: Sparkles,
    tone: 'white',
    gradient: ['#a855f7', '#ec4899'],
    emoji: '💆',
  },
  {
    id: 'moxa-stick',
    slogan: '温养安康',
    name: '随身家用艾灸棒',
    blessing: '随身一灸,温养入里。',
    icon: HeartPulse,
    tone: 'white',
    gradient: ['#f97316', '#dc2626'],
    emoji: '🔥',
  },
  {
    id: 'lego-cake',
    slogan: '步步生甜',
    name: '乐高蛋糕积木',
    blessing: '一块一块,搭出甜日子。',
    icon: CakeSlice,
    tone: 'pink',
    gradient: ['#ec4899', '#f43f5e'],
    emoji: '🎂',
  },
  {
    id: 'wangwang-box',
    slogan: '旺气加持',
    name: '旺旺零食大礼盒',
    blessing: '旺旺上场,福气加持。',
    icon: Gift,
    tone: 'pink',
    gradient: ['#dc2626', '#7c3aed'],
    emoji: '🎁',
  },
  {
    id: 'stanley-cup',
    slogan: '带薪吨吨吨喝水!',
    name: 'Stanley吸管杯',
    blessing: '带薪吨吨吨,水份也得拉满。',
    icon: CupSoda,
    tone: 'pink',
    gradient: ['#06b6d4', '#3b82f6'],
    emoji: '🥤',
  },
  {
    id: 'rest-blanket',
    slogan: '休息,休息一下',
    leaves: 1,
    name: '合法休息抱枕毯',
    blessing: '合法摸鱼,心安理得躺平。',
    icon: BedDouble,
    tone: 'pink',
    gradient: ['#6366f1', '#a855f7'],
    emoji: '🛌',
  },
  {
    id: 'fragrance-set',
    slogan: '香气魔法',
    sloganLine2: '启动!',
    leaves: 2,
    name: '香氛礼盒身体护理套装',
    blessing: '一抹香气,全身柔软发光。',
    icon: Flower2,
    tone: 'pink',
    gradient: ['#f43f5e', '#f59e0b'],
    emoji: '🌸',
  },
  {
    id: 'popmart-blind',
    slogan: '未知',
    sloganLine2: '惊喜',
    name: '泡泡玛特盲盒',
    blessing: '抽到哪只都是命定的可爱。',
    icon: Boxes,
    tone: 'pink',
    gradient: ['#8b5cf6', '#ec4899'],
    emoji: '🎲',
  },
  {
    id: 'hair-mask',
    slogan: '秀发',
    sloganLine2: '生财',
    name: '发财炮弹发膜',
    blessing: '一头顺发,财运自然来。',
    icon: Droplets,
    tone: 'white',
    gradient: ['#0ea5e9', '#22c55e'],
    emoji: '💰',
  },
  {
    id: 'rich-flower',
    slogan: '马上有',
    sloganLine2: '钱花',
    name: '有钱花玩偶',
    blessing: '怀里抱花,卡里有钱。',
    icon: Coins,
    tone: 'white',
    gradient: ['#eab308', '#f97316'],
    emoji: '🌸',
  },
]

export interface HiddenPrize {
  id: string
  name: string
  blessing: string
  emoji: string
  gradient: [string, string]
}

export const HIDDEN_PRIZE: HiddenPrize = {
  id: 'laifen-dryer',
  name: '徕芬吹风机',
  blessing: '惊喜降临——徕芬吹风机,愿秀发如瀑,日日顺滑。',
  emoji: '🌬️',
  gradient: ['#fbbf24', '#f97316'],
}
