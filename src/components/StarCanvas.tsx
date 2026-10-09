import { useEffect, useRef } from 'react'

/**
 * 全屏 Canvas 星空装饰动画系统:
 *  - 静态星星 (背景层): 随机位置缓慢闪烁
 *  - 飘落星星: 从上方出现, 以螺旋/摇摆轨迹缓慢下落
 *  - 流星: 从屏幕一侧斜向高速划过, 带拖尾
 *  - 漂浮爱心: 从底部缓慢上升, 左右摇摆
 *
 * Canvas 渲染, 性能不受 DOM 粒子数量影响. 固定层
 * (fixed inset-0), pointer-events-none, 不拦截点击.
 */

interface Star {
  x: number
  y: number
  r: number
  baseAlpha: number
  twinkleSpeed: number
  twinklePhase: number
}

interface FallingStar {
  x: number
  y: number
  r: number
  vy: number
  swayAmp: number
  swayPhase: number
  swaySpeed: number
  rotation: number
  rotationSpeed: number
  alpha: number
  life: number
  maxLife: number
  type: 'star' | 'moon'
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  len: number
  alpha: number
  life: number
  maxLife: number
}

interface FloatingHeart {
  x: number
  y: number
  size: number
  vy: number
  swayAmp: number
  swayPhase: number
  swaySpeed: number
  alpha: number
  rotation: number
  life: number
  maxLife: number
}

const COLORS = {
  starFill: '#fff4d4',
  starGlow: '#ffd9a0',
  heart: '#ff6b9d',
  heartGlow: '#ff9ec1',
  shooting: '#ffffff',
  shootingTrail: '#ffd9a0',
  moonFill: '#fefce8',
  moonGlow: '#fde68a',
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  spikes: number,
  rotation: number,
) {
  ctx.beginPath()
  const step = Math.PI / spikes
  ctx.moveTo(cx + Math.cos(rotation) * outerR, cy + Math.sin(rotation) * outerR)
  for (let i = 0; i < spikes; i++) {
    rotation += step
    ctx.lineTo(
      cx + Math.cos(rotation) * innerR,
      cy + Math.sin(rotation) * innerR,
    )
    rotation += step
    ctx.lineTo(
      cx + Math.cos(rotation) * outerR,
      cy + Math.sin(rotation) * outerR,
    )
  }
  ctx.closePath()
}

function drawMoon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rotation: number,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  // 弯月: 大圆减小圆偏移
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.restore()
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  const s = size / 2
  ctx.beginPath()
  ctx.moveTo(0, s * 0.3)
  ctx.bezierCurveTo(0, 0, -s, 0, -s, s * 0.3)
  ctx.bezierCurveTo(-s, s * 0.7, 0, s, 0, s * 1.1)
  ctx.bezierCurveTo(0, s, s, s * 0.7, s, s * 0.3)
  ctx.bezierCurveTo(s, 0, 0, 0, 0, s * 0.3)
  ctx.closePath()
  ctx.restore()
}

export function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // --- 静态背景星星 ---
    const staticStars: Star[] = []
    const starCount = Math.floor((width * height) / 12000)
    for (let i = 0; i < starCount; i++) {
      staticStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.5 + Math.random() * 1.8,
        baseAlpha: 0.15 + Math.random() * 0.5,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    // --- 飘落星星池 ---
    const fallingStars: FallingStar[] = []
    const maxFalling = 8

    const spawnFalling = () => {
      if (fallingStars.length >= maxFalling) return
      fallingStars.push({
        x: Math.random() * width,
        y: -20,
        r: 2 + Math.random() * 4,
        vy: 0.3 + Math.random() * 0.6,
        swayAmp: 15 + Math.random() * 35,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        alpha: 0,
        life: 0,
        maxLife: 600 + Math.random() * 400,
        type: Math.random() < 0.4 ? 'moon' : 'star',
      })
    }

    // --- 流星池 ---
    const shootingStars: ShootingStar[] = []
    const maxShooting = 3

    const spawnShooting = () => {
      if (shootingStars.length >= maxShooting) return
      const fromLeft = Math.random() > 0.5
      const startX = fromLeft
        ? -50
        : width + 50
      const startY = Math.random() * height * 0.4
      const angle = fromLeft
        ? Math.PI * 0.15 + Math.random() * Math.PI * 0.1
        : Math.PI - Math.PI * 0.15 - Math.random() * Math.PI * 0.1
      const speed = 8 + Math.random() * 6
      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 80 + Math.random() * 60,
        alpha: 0,
        life: 0,
        maxLife: 80 + Math.random() * 40,
      })
    }

    // --- 漂浮爱心池 ---
    const floatingHearts: FloatingHeart[] = []
    const maxHearts = 5

    const spawnHeart = () => {
      if (floatingHearts.length >= maxHearts) return
      floatingHearts.push({
        x: Math.random() * width,
        y: height + 20,
        size: 6 + Math.random() * 8,
        vy: 0.2 + Math.random() * 0.4,
        swayAmp: 10 + Math.random() * 25,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.015,
        alpha: 0,
        rotation: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: 800 + Math.random() * 500,
      })
    }

    let frame = 0
    let animId = 0

    const render = () => {
      frame++
      ctx.clearRect(0, 0, width, height)

      const t = frame * 0.016

      // 1. 静态星星闪烁
      for (const s of staticStars) {
        const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.3
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
        ctx.fillStyle = COLORS.starFill
        ctx.shadowBlur = s.r * 3
        ctx.shadowColor = COLORS.starGlow
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0

      // 2. 飘落星星
      for (let i = fallingStars.length - 1; i >= 0; i--) {
        const s = fallingStars[i]
        s.life++
        s.y += s.vy
        s.swayPhase += s.swaySpeed
        s.rotation += s.rotationSpeed
        const swayX = s.x + Math.sin(s.swayPhase) * s.swayAmp

        // 淡入淡出
        const lifeRatio = s.life / s.maxLife
        if (lifeRatio < 0.1) {
          s.alpha = lifeRatio / 0.1
        } else if (lifeRatio > 0.8) {
          s.alpha = (1 - lifeRatio) / 0.2
        } else {
          s.alpha = 1
        }

        ctx.globalAlpha = Math.max(0, s.alpha)

        if (s.type === 'moon') {
          ctx.fillStyle = COLORS.moonFill
          ctx.shadowBlur = s.r * 5
          ctx.shadowColor = COLORS.moonGlow
          // 弯月: 画完整圆再用 destination-out 挖出月牙
          const moonR = s.r * 2
          ctx.save()
          // 先画满月
          drawMoon(ctx, swayX, s.y, moonR, s.rotation)
          ctx.fill()
          // 再用合成模式挖出弯月
          ctx.globalCompositeOperation = 'destination-out'
          ctx.beginPath()
          ctx.arc(swayX + moonR * 0.4, s.y - moonR * 0.2, moonR * 0.85, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalCompositeOperation = 'source-over'
          ctx.restore()
        } else {
          ctx.fillStyle = COLORS.starFill
          ctx.shadowBlur = s.r * 4
          ctx.shadowColor = COLORS.starGlow
          drawStar(ctx, swayX, s.y, s.r * 2.2, s.r * 0.9, 5, s.rotation)
          ctx.fill()
        }

        if (s.life >= s.maxLife || s.y > height + 30) {
          fallingStars.splice(i, 1)
        }
      }
      ctx.shadowBlur = 0

      // 3. 流星
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]
        s.life++
        s.x += s.vx
        s.y += s.vy

        const lifeRatio = s.life / s.maxLife
        if (lifeRatio < 0.15) {
          s.alpha = lifeRatio / 0.15
        } else if (lifeRatio > 0.7) {
          s.alpha = (1 - lifeRatio) / 0.3
        } else {
          s.alpha = 1
        }

        ctx.globalAlpha = Math.max(0, s.alpha)

        // 拖尾
        const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.len
        const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.len
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY)
        grad.addColorStop(0, COLORS.shooting)
        grad.addColorStop(0.4, COLORS.shootingTrail)
        grad.addColorStop(1, 'rgba(255,217,160,0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(tailX, tailY)
        ctx.stroke()

        // 头部光点
        ctx.fillStyle = COLORS.shooting
        ctx.shadowBlur = 8
        ctx.shadowColor = COLORS.shooting
        ctx.beginPath()
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2)
        ctx.fill()

        if (s.life >= s.maxLife || s.x < -100 || s.x > width + 100 || s.y > height + 100) {
          shootingStars.splice(i, 1)
        }
      }
      ctx.shadowBlur = 0

      // 4. 漂浮爱心
      for (let i = floatingHearts.length - 1; i >= 0; i--) {
        const h = floatingHearts[i]
        h.life++
        h.y -= h.vy
        h.swayPhase += h.swaySpeed
        const swayX = h.x + Math.sin(h.swayPhase) * h.swayAmp

        const lifeRatio = h.life / h.maxLife
        if (lifeRatio < 0.1) {
          h.alpha = lifeRatio / 0.1
        } else if (lifeRatio > 0.8) {
          h.alpha = (1 - lifeRatio) / 0.2
        } else {
          h.alpha = 1
        }

        ctx.globalAlpha = Math.max(0, h.alpha) * 0.7
        ctx.fillStyle = COLORS.heart
        ctx.shadowBlur = h.size
        ctx.shadowColor = COLORS.heartGlow
        drawHeart(ctx, swayX, h.y, h.size, h.rotation)
        ctx.fill()

        if (h.life >= h.maxLife || h.y < -30) {
          floatingHearts.splice(i, 1)
        }
      }
      ctx.shadowBlur = 0

      // 生成新粒子
      if (frame % 80 === 0) spawnFalling()
      if (frame % 200 === 0 && Math.random() > 0.3) spawnShooting()
      if (frame % 120 === 0) spawnHeart()

      animId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20"
      aria-hidden
    />
  )
}
