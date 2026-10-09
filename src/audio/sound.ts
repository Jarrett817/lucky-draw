import * as Tone from 'tone'

// ============================================================
// 抽奖页音效 + 背景音乐
// ------------------------------------------------------------
// Tone.js 合成器方案: 无需音频文件, 离线环境 (酒店大屏 kiosk)
// 也能稳定播放. BGM = 欢快流行进行 (I-V-vi-IV) + 跳跃 marimba 主旋律
// + 低音 oom-pah + 和弦切换铃铛 sparkle, 营造趣味开心氛围.
// SFX = 点击 / 拆封上升音阶 / 解锁彩蛋 fanfare.
// 浏览器拦截自动播放, BGM 必须由用户首次交互触发 (see App.tsx
// 里的 pointerdown 监听 + ControlBar 的静音切换按钮).
//
// 调度方式: 用单个 setInterval 走 8 分音步进 (tracker 模式),
// 同步触发低音 / 和弦 / marimba / 铃铛. 不依赖 Tone.Transport,
// 因为 Transport 在某些环境下首次 start() 后 Loop callback 不一定
// 触发, 而 triggerAttackRelease(note, dur, undefined, vel) 走
// Tone.now() 反而稳定.
// ============================================================

// ---------- BGM 状态 ----------
let started = false
let muted = false
let bgmGain: Tone.Gain | null = null
let bassSynth: Tone.Synth | null = null
let chordPad: Tone.PolySynth | null = null
let marimba: Tone.Synth | null = null
let bellSynth: Tone.Synth | null = null

// 背景音乐音量 (SFX 之外的独立 gain)
const BGM_VOLUME = 0.5
const BPM = 108

// I-V-vi-IV in C major — 经典欢快流行进行, 4 和弦 × 2 小节 = 8 小节一圈
const CHORDS: ReadonlyArray<ReadonlyArray<string>> = [
  ['C3', 'E3', 'G3', 'B3'], // Cmaj7
  ['G2', 'B2', 'D3', 'F3'], // G7
  ['A2', 'C3', 'E3', 'G3'], // Am7
  ['F2', 'A2', 'C3', 'E3'], // Fmaj7
]

// 低音: 每和弦根音 + 五音, 走 oom-pah 律动
const BASS_ROOT = ['C2', 'G2', 'A2', 'F2']
const BASS_FIFTH = ['G2', 'D3', 'E3', 'C3']

// 和弦切换时点缀的高音铃铛
const SPARKLE = ['C6', 'D6', 'E6', 'C6']

// marimba 主旋律: 每和弦 2 小节 = 16 个 1/8 音, 跳跃有童趣
// (上下行交替 + 跨弦跳进, 听起来像卡通 / 游戏过场)
const ARP: ReadonlyArray<string> = [
  // Cmaj7
  'C5',
  'E5',
  'G5',
  'E5',
  'C5',
  'E5',
  'G5',
  'B5',
  'C6',
  'B5',
  'G5',
  'E5',
  'C5',
  'E5',
  'G5',
  'E5',
  // G7
  'G4',
  'B4',
  'D5',
  'B4',
  'G4',
  'B4',
  'D5',
  'F5',
  'G5',
  'F5',
  'D5',
  'B4',
  'G4',
  'B4',
  'D5',
  'B4',
  // Am7
  'A4',
  'C5',
  'E5',
  'C5',
  'A4',
  'C5',
  'E5',
  'G5',
  'A5',
  'G5',
  'E5',
  'C5',
  'A4',
  'C5',
  'E5',
  'C5',
  // Fmaj7
  'F4',
  'A4',
  'C5',
  'A4',
  'F4',
  'A4',
  'C5',
  'E5',
  'F5',
  'E5',
  'C5',
  'A4',
  'F4',
  'A4',
  'C5',
  'A4',
]

async function buildBgm() {
  if (started) return
  await Tone.start()

  bgmGain = new Tone.Gain(muted ? 0 : BGM_VOLUME).toDestination()

  // 低音 (三角波, 厚实不刺耳) — oom-pah 根音-五音律动
  bassSynth = new Tone.Synth({
    volume: -6,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 0.4 },
  }).connect(bgmGain)

  // 和弦垫 (sine, 柔润底色)
  chordPad = new Tone.PolySynth(Tone.Synth, {
    volume: -12,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.4, decay: 0.4, sustain: 0.6, release: 1.2 },
  }).connect(bgmGain)

  // marimba 主旋律 (三角波, 跳跃明亮)
  marimba = new Tone.Synth({
    volume: -8,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.25, sustain: 0.05, release: 0.3 },
  }).connect(bgmGain)

  // 铃铛 sparkle (sine, 高音, 和弦切换时点缀一点仙气)
  bellSynth = new Tone.Synth({
    volume: -10,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.002, decay: 0.6, sustain: 0, release: 0.5 },
  }).connect(bgmGain)

  // 单个 setInterval 走 8 分音步进, 同步调度 4 个层
  const stepMs = ((60 / BPM) * 1000) / 2 // 8 分音 ≈ 277.78ms @ 108 BPM
  const chordSteps = 16 // 2 小节 × 8 个 8 分音
  const chordSec = (chordSteps * stepMs) / 1000

  let step = 0
  const tick = () => {
    const chordIdx = Math.floor(step / chordSteps) % CHORDS.length
    const inChord = step % chordSteps
    const inBar = step % 8

    // 和弦切换: 触发 chord pad (持续整个和弦周期) + sparkle 铃铛
    if (inChord === 0) {
      chordPad?.triggerAttackRelease(
        CHORDS[chordIdx] as string[],
        chordSec,
        undefined,
        0.3,
      )
      bellSynth?.triggerAttackRelease(SPARKLE[chordIdx], '4n', undefined, 0.4)
    }

    // 低音 oom-pah: 每小节 beat 1 (step 0) 根音, beat 3 (step 4) 五音
    if (inBar === 0) {
      bassSynth?.triggerAttackRelease(BASS_ROOT[chordIdx], '2n', undefined, 0.6)
    } else if (inBar === 4) {
      bassSynth?.triggerAttackRelease(
        BASS_FIFTH[chordIdx],
        '2n',
        undefined,
        0.6,
      )
    }

    // marimba 主旋律: 每个 8 分音都播
    marimba?.triggerAttackRelease(ARP[step % ARP.length], '8n', undefined, 0.4)

    step++
  }

  // 立即触发首拍, 让用户点一下就听到 BGM
  tick()
  setInterval(tick, stepMs)

  started = true
}

// ---------- SFX 状态 ----------
let sfxReady = false
let sfxGain: Tone.Gain | null = null
let clickSynth: Tone.Synth | null = null
let chimeSynth: Tone.PolySynth | null = null

function buildSfx() {
  if (sfxReady) return
  sfxGain = new Tone.Gain(0.6).toDestination()

  // 点击: 短促高音, 干净不腻
  clickSynth = new Tone.Synth({
    volume: -10,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.04 },
  }).connect(sfxGain)

  // 拆封 / 解锁 fanfare 用同一颗 sine chime, 复用资源
  chimeSynth = new Tone.PolySynth(Tone.Synth, {
    volume: -8,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.4, release: 0.6 },
  }).connect(sfxGain)
  sfxReady = true
}

function sfxGateOpen() {
  return Tone.context.state === 'running'
}

// ---------- 公开 API ----------

/**
 * 仅解锁 AudioContext (不启动 BGM). 用于首页首次交互,
 * 让点击音效可用, 但不播放背景音乐.
 */
export async function unlockAudio() {
  await Tone.start()
}

/**
 * 构建 BGM 节点并立即触发首拍. 仅在进入抽奖页时调用.
 */
export async function ensureAudioStarted() {
  await buildBgm()
}

/** 点击卡片时的轻点击声 */
export function playClick() {
  if (!sfxReady) buildSfx()
  if (!sfxGateOpen()) return
  clickSynth?.triggerAttackRelease('C6', '32n', undefined, 0.5)
}

/** 拆封 / 揭晓卡片时的上升三音 (E-G-C 大三和弦) */
export function playReveal() {
  if (!sfxReady) buildSfx()
  if (!sfxGateOpen()) return
  const now = Tone.now()
  chimeSynth?.triggerAttackRelease('E5', '8n', now, 0.5)
  chimeSynth?.triggerAttackRelease('G5', '8n', now + 0.1, 0.5)
  chimeSynth?.triggerAttackRelease('C6', '4n', now + 0.2, 0.6)
}

/** 解锁彩蛋时的闪亮 fanfare */
export function playUnlock() {
  if (!sfxReady) buildSfx()
  if (!sfxGateOpen()) return
  const now = Tone.now()
  chimeSynth?.triggerAttackRelease(['C5', 'E5', 'G5'], '4n', now, 0.6)
  chimeSynth?.triggerAttackRelease(['D5', 'F5', 'A5'], '4n', now + 0.15, 0.6)
  chimeSynth?.triggerAttackRelease(
    ['C5', 'E5', 'G5', 'C6'],
    '2n',
    now + 0.3,
    0.7,
  )
}

/** 静音 / 取消静音 BGM (SFX 不受影响) */
export function setBgmMuted(m: boolean) {
  muted = m
  if (bgmGain) bgmGain.gain.rampTo(m ? 0 : BGM_VOLUME, 0.4)
}

export function isBgmMuted() {
  return muted
}

export function isAudioStarted() {
  return started
}
