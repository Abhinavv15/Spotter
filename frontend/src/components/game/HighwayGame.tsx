import React, { useRef, useEffect, useState } from 'react'
import { RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react'
import { Badge } from '../ui/badge'

interface Obstacle {
  x: number // 0: Left, 1: Center, 2: Right
  y: number
  type: 'CAR' | 'FUEL' | 'COFFEE' | 'SHIELD'
  speed: number
  color: string
}

export const HighwayGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAutoPilot, setIsAutoPilot] = useState(true)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('spotter_truck_highscore') || '450', 10)
    } catch {
      return 450
    }
  })
  const [fuel, setFuel] = useState(85)
  const [hosHours, setHosHours] = useState(6.4)
  const [speed] = useState(62)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  // Game internal refs for 60fps loop
  const stateRef = useRef({
    truckLane: 1, // 0: Left, 1: Center, 2: Right
    targetLaneX: 1,
    truckX: 1, // Smooth float position
    obstacles: [] as Obstacle[],
    roadOffset: 0,
    score: 0,
    fuel: 85,
    hosHours: 6.4,
    speed: 62,
    gameOver: false,
    lastSpawn: 0,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    autoPilotDecisionTimer: 0
  })

  // Simple Web Audio API sound synthesizer
  const playBeep = (freq: number, type: OscillatorType = 'sine', duration: number = 0.08) => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Audio context policy
    }
  }

  // Handle Lane Steering (Player or Auto)
  const steer = (dir: 'left' | 'right') => {
    if (dir === 'left') {
      stateRef.current.truckLane = Math.max(0, stateRef.current.truckLane - 1)
    } else {
      stateRef.current.truckLane = Math.min(2, stateRef.current.truckLane + 1)
    }
    playBeep(440, 'triangle', 0.05)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        setIsAutoPilot(false)
        steer('left')
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        setIsAutoPilot(false)
        steer('right')
      } else if (e.code === 'Space') {
        if (stateRef.current.gameOver) {
          restartGame()
        } else {
          setIsAutoPilot(prev => !prev)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const restartGame = () => {
    stateRef.current = {
      truckLane: 1,
      targetLaneX: 1,
      truckX: 1,
      obstacles: [],
      roadOffset: 0,
      score: 0,
      fuel: 85,
      hosHours: 6.4,
      speed: 62,
      gameOver: false,
      lastSpawn: 0,
      particles: [],
      autoPilotDecisionTimer: 0
    }
    setScore(0)
    setFuel(85)
    setHosHours(6.4)
    setGameOver(false)
  }

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let lastTime = performance.now()

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      const state = stateRef.current
      const width = canvas.width
      const height = canvas.height

      // ── 1. Update Game Physics ─────────────────────────────────────────────
      if (!state.gameOver) {
        state.roadOffset = (state.roadOffset + state.speed * dt * 8) % 60
        state.score += dt * (state.speed * 0.25)
        setScore(Math.floor(state.score))

        if (state.score > highScore) {
          setHighScore(Math.floor(state.score))
          try {
            localStorage.setItem('spotter_truck_highscore', String(Math.floor(state.score)))
          } catch {}
        }

        // Slowly consume fuel and increment driving hours
        state.fuel = Math.max(0, state.fuel - dt * 0.8)
        state.hosHours = Math.min(11, state.hosHours + dt * 0.04)
        setFuel(Math.round(state.fuel))
        setHosHours(Number(state.hosHours.toFixed(1)))

        // Smooth Truck Interpolation
        state.truckX += (state.truckLane - state.truckX) * Math.min(1, dt * 14)

        // ── Auto-Pilot AI Logic ───────────────────────────────────────────────
        if (isAutoPilot) {
          state.autoPilotDecisionTimer += dt
          if (state.autoPilotDecisionTimer > 0.18) {
            state.autoPilotDecisionTimer = 0
            // Look for oncoming obstacles in our current and adjacent lanes
            const nearbyThreats = state.obstacles.filter(o => o.type === 'CAR' && o.y > height * 0.35 && o.y < height * 0.82)
            const bonusItems = state.obstacles.filter(o => o.type !== 'CAR' && o.y > height * 0.2 && o.y < height * 0.75)

            // Dodge cars
            const threatInMyLane = nearbyThreats.find(o => o.x === state.truckLane)
            if (threatInMyLane) {
              const safeLanes = [0, 1, 2].filter(lane => !nearbyThreats.some(o => o.x === lane))
              if (safeLanes.length > 0) {
                // Pick closest safe lane
                safeLanes.sort((a, b) => Math.abs(a - state.truckLane) - Math.abs(b - state.truckLane))
                state.truckLane = safeLanes[0]
              }
            } else if (bonusItems.length > 0) {
              // Steer toward fuel/coffee if safe
              const bestBonus = bonusItems[0]
              const bonusThreat = nearbyThreats.find(o => o.x === bestBonus.x)
              if (!bonusThreat) {
                state.truckLane = bestBonus.x
              }
            }
          }
        }

        // ── Spawn Obstacles & Collectibles ───────────────────────────────────
        state.lastSpawn += dt
        if (state.lastSpawn > 1.25) {
          state.lastSpawn = 0
          const lane = Math.floor(Math.random() * 3)
          const roll = Math.random()
          let type: Obstacle['type'] = 'CAR'
          let color = '#E2E8F0'

          if (roll < 0.25) {
            type = 'FUEL'
            color = '#FACC15'
          } else if (roll < 0.45) {
            type = 'COFFEE'
            color = '#38BDF8'
          } else if (roll < 0.6) {
            type = 'SHIELD'
            color = '#8AE922'
          } else {
            type = 'CAR'
            color = roll > 0.8 ? '#EF4444' : '#64748B'
          }

          state.obstacles.push({
            x: lane,
            y: -60,
            type,
            speed: type === 'CAR' ? 140 : 200,
            color
          })
        }

        // ── Move Obstacles & Check Collisions ────────────────────────────────
        const laneWidth = width / 3
        const truckY = height - 90

        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const o = state.obstacles[i]
          o.y += (state.speed * 3.5 + o.speed * 0.5) * dt

          const obsX = o.x * laneWidth + laneWidth / 2
          const truckActualX = state.truckX * laneWidth + laneWidth / 2

          // Collision Check
          const dx = Math.abs(obsX - truckActualX)
          const dy = Math.abs(o.y - truckY)

          if (dx < 32 && dy < 48) {
            if (o.type === 'CAR') {
              state.gameOver = true
              setGameOver(true)
              playBeep(180, 'sawtooth', 0.3)
              // Spawn explosion particles
              for (let p = 0; p < 25; p++) {
                state.particles.push({
                  x: truckActualX,
                  y: truckY,
                  vx: (Math.random() - 0.5) * 260,
                  vy: (Math.random() - 0.5) * 260,
                  life: 1.0,
                  color: p % 2 === 0 ? '#EF4444' : '#8AE922'
                })
              }
            } else {
              // Collected bonus!
              if (o.type === 'FUEL') {
                state.fuel = Math.min(100, state.fuel + 25)
                state.score += 150
                playBeep(660, 'sine', 0.12)
              } else if (o.type === 'COFFEE') {
                state.hosHours = Math.max(0, state.hosHours - 2.5) // Reset 30m break clock
                state.score += 120
                playBeep(880, 'sine', 0.12)
              } else if (o.type === 'SHIELD') {
                state.score += 250
                playBeep(1100, 'sine', 0.15)
              }
              // Spawn collection sparks
              for (let p = 0; p < 12; p++) {
                state.particles.push({
                  x: obsX,
                  y: o.y,
                  vx: (Math.random() - 0.5) * 160,
                  vy: (Math.random() - 0.5) * 160,
                  life: 0.7,
                  color: o.color
                })
              }
              state.obstacles.splice(i, 1)
              continue
            }
          }

          // Remove off-screen
          if (o.y > height + 80) {
            state.obstacles.splice(i, 1)
          }
        }

        // Update particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i]
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.life -= dt * 1.8
          if (p.life <= 0) state.particles.splice(i, 1)
        }
      }

      // ── 2. Render Canvas Graphics ──────────────────────────────────────────
      // Background Road
      ctx.fillStyle = '#060B08'
      ctx.fillRect(0, 0, width, height)

      // Road shoulder green glow
      ctx.fillStyle = 'rgba(138, 233, 34, 0.08)'
      ctx.fillRect(0, 0, 14, height)
      ctx.fillRect(width - 14, 0, 14, height)

      // Guardrails
      ctx.strokeStyle = 'rgba(138, 233, 34, 0.4)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(14, 0)
      ctx.lineTo(14, height)
      ctx.moveTo(width - 14, 0)
      ctx.lineTo(width - 14, height)
      ctx.stroke()

      // Lane dividers (Dashed)
      const laneWidth = width / 3
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.lineWidth = 2
      ctx.setLineDash([24, 20])
      ctx.lineDashOffset = -state.roadOffset

      ctx.beginPath()
      ctx.moveTo(laneWidth, 0)
      ctx.lineTo(laneWidth, height)
      ctx.moveTo(laneWidth * 2, 0)
      ctx.lineTo(laneWidth * 2, height)
      ctx.stroke()
      ctx.setLineDash([]) // Reset

      // Render Obstacles & Collectibles
      for (const o of state.obstacles) {
        const ox = o.x * laneWidth + laneWidth / 2
        const oy = o.y

        if (o.type === 'CAR') {
          // Four-wheeler car
          ctx.fillStyle = o.color
          ctx.shadowColor = o.color
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.roundRect(ox - 14, oy - 24, 28, 48, 6)
          ctx.fill()
          ctx.shadowBlur = 0

          // Windshield
          ctx.fillStyle = '#0F172A'
          ctx.fillRect(ox - 10, oy - 8, 20, 12)
          // Headlights
          ctx.fillStyle = '#FEF08A'
          ctx.fillRect(ox - 11, oy + 18, 5, 4)
          ctx.fillRect(ox + 6, oy + 18, 5, 4)
        } else {
          // Bonus item (Fuel, Coffee, Shield)
          ctx.fillStyle = o.color
          ctx.shadowColor = o.color
          ctx.shadowBlur = 14
          ctx.beginPath()
          ctx.arc(ox, oy, 16, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0

          // Icon label
          ctx.fillStyle = '#080D0A'
          ctx.font = 'bold 12px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const label = o.type === 'FUEL' ? '⛽' : o.type === 'COFFEE' ? '☕' : '🛡️'
          ctx.fillText(label, ox, oy)
        }
      }

      // Render Semi-Truck Trailer & Cab
      const truckActualX = state.truckX * laneWidth + laneWidth / 2
      const truckY = height - 90

      // Headlight Cones
      const grad = ctx.createLinearGradient(0, truckY - 140, 0, truckY)
      grad.addColorStop(0, 'rgba(138, 233, 34, 0.35)')
      grad.addColorStop(1, 'rgba(138, 233, 34, 0.0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(truckActualX - 16, truckY)
      ctx.lineTo(truckActualX - 45, truckY - 150)
      ctx.lineTo(truckActualX + 45, truckY - 150)
      ctx.lineTo(truckActualX + 16, truckY)
      ctx.closePath()
      ctx.fill()

      // Truck Trailer (53ft Freight Box)
      ctx.fillStyle = '#14251B'
      ctx.strokeStyle = '#8AE922'
      ctx.lineWidth = 1.5
      ctx.shadowColor = 'rgba(138, 233, 34, 0.6)'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.roundRect(truckActualX - 18, truckY - 10, 36, 68, 4)
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0

      // Trailer Roof Markings
      ctx.fillStyle = '#8AE922'
      ctx.font = 'bold 8px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SPOTTER', truckActualX, truckY + 22)

      // Truck Cab (Tractor)
      ctx.fillStyle = '#8AE922'
      ctx.beginPath()
      ctx.roundRect(truckActualX - 16, truckY - 36, 32, 28, 4)
      ctx.fill()

      // Windshield
      ctx.fillStyle = '#080D0A'
      ctx.fillRect(truckActualX - 12, truckY - 32, 24, 8)

      // Dual Exhaust stacks
      ctx.fillStyle = '#94A3B8'
      ctx.fillRect(truckActualX - 18, truckY - 24, 3, 12)
      ctx.fillRect(truckActualX + 15, truckY - 24, 3, 12)

      // Render Particles
      for (const p of state.particles) {
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1.0

      // Game Over Overlay
      if (state.gameOver) {
        ctx.fillStyle = 'rgba(8, 13, 10, 0.85)'
        ctx.fillRect(0, 0, width, height)

        ctx.fillStyle = '#EF4444'
        ctx.font = 'bold 22px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('HOS DISPATCH ACCIDENT', width / 2, height / 2 - 30)

        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 14px monospace'
        ctx.fillText(`Final Mileage: ${Math.floor(state.score)} mi`, width / 2, height / 2 + 5)

        ctx.fillStyle = '#8AE922'
        ctx.font = 'bold 12px system-ui, sans-serif'
        ctx.fillText('Click "Restart" or press Space to Re-dispatch', width / 2, height / 2 + 40)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationFrameId)
  }, [highScore, isAutoPilot, soundEnabled])

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 select-none relative overflow-hidden">
      
      {/* ── Top HUD Strip ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-[#080D0A]/90 border border-white/15 flex items-center gap-1.5 font-mono text-xs">
            <Trophy size={13} className="text-amber-400" />
            <span className="text-white font-bold">{score}</span>
            <span className="text-slate-500 text-[10px]">mi</span>
          </div>
          <Badge variant="lime" className="text-[10px] py-0.5 px-2 font-mono uppercase">
            {isAutoPilot ? '🤖 Auto-Pilot AI' : '🎮 Manual Drive'}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-[#080D0A]/80 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-[#8AE922]" /> : <VolumeX size={14} />}
          </button>
          <button
            onClick={() => setIsAutoPilot(!isAutoPilot)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
              isAutoPilot
                ? 'bg-[#8AE922] text-[#080D0A] border-[#8AE922]'
                : 'bg-[#080D0A]/80 text-slate-300 border-white/10 hover:border-[#8AE922]/50'
            }`}
          >
            {isAutoPilot ? 'AI Active' : 'Drive'}
          </button>
        </div>
      </div>

      {/* ── Main Highway Canvas ──────────────────────────────────────────────── */}
      <div className="relative flex-1 my-2 rounded-2xl overflow-hidden border border-white/15 shadow-inner">
        <canvas
          ref={canvasRef}
          width={360}
          height={320}
          className="w-full h-full object-cover block"
        />

        {/* Steering Touch Controls (Left & Right halves for mobile/touch) */}
        <div className="absolute inset-0 flex z-20">
          <button
            onClick={() => {
              setIsAutoPilot(false)
              steer('left')
            }}
            className="w-1/2 h-full active:bg-white/5 opacity-0 focus:outline-none"
            aria-label="Steer Left"
          />
          <button
            onClick={() => {
              setIsAutoPilot(false)
              steer('right')
            }}
            className="w-1/2 h-full active:bg-white/5 opacity-0 focus:outline-none"
            aria-label="Steer Right"
          />
        </div>
      </div>

      {/* ── Bottom Telemetry Dashboard & Controls ───────────────────────────── */}
      <div className="space-y-2 z-10">
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
          {/* Speed */}
          <div className="p-1.5 rounded-xl bg-[#080D0A]/90 border border-white/10">
            <span className="text-slate-400 block text-[9px] uppercase">Speed</span>
            <span className="font-bold text-white">{speed} MPH</span>
          </div>
          {/* Fuel */}
          <div className="p-1.5 rounded-xl bg-[#080D0A]/90 border border-white/10">
            <span className="text-slate-400 block text-[9px] uppercase">Fuel</span>
            <span className={`font-bold ${fuel < 30 ? 'text-rose-400' : 'text-amber-400'}`}>
              {fuel}%
            </span>
          </div>
          {/* HOS Drive Clock */}
          <div className="p-1.5 rounded-xl bg-[#080D0A]/90 border border-white/10">
            <span className="text-slate-400 block text-[9px] uppercase">11h Cap</span>
            <span className="font-bold text-[#8AE922]">{hosHours}h / 11h</span>
          </div>
        </div>

        {/* Steer / Restart Controls */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setIsAutoPilot(false)
                steer('left')
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs active:scale-95 transition-all font-heading"
            >
              ◀ Left
            </button>
            <button
              onClick={() => {
                setIsAutoPilot(false)
                steer('right')
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs active:scale-95 transition-all font-heading"
            >
              Right ▶
            </button>
          </div>

          <div className="flex items-center gap-2">
            {gameOver && (
              <button
                onClick={restartGame}
                className="px-3 py-1.5 rounded-xl bg-[#8AE922] text-[#080D0A] font-extrabold text-xs flex items-center gap-1 shadow-glow-lime hover:bg-[#9EF538] transition-all font-heading"
              >
                <RotateCcw size={12} />
                Restart
              </button>
            )}
            <span className="text-[10px] text-slate-400 hidden sm:inline font-mono">
              [← / → / A / D keys]
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
