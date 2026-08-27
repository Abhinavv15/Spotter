/**
 * HeroScene.tsx
 * Three.js animated hero visual — an animated globe with route arcs.
 * Uses @react-three/fiber and @react-three/drei.
 */
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'

// ── Rotating wireframe globe ──────────────────────────────────────────────────
function Globe() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.8, 32, 32]} />
      <meshStandardMaterial
        color="#1e3a5f"
        wireframe
        transparent
        opacity={0.35}
        emissive="#1e40af"
        emissiveIntensity={0.15}
      />
    </mesh>
  )
}

// ── Glowing route arc ─────────────────────────────────────────────────────────
function RouteArc({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(2.4)
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    return curve.getPoints(40)
  }, [from, to])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.7}
    />
  )
}

// ── Pulsing node ─────────────────────────────────────────────────────────────
function Node({ pos, color }: { pos: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = 1 + 0.3 * Math.sin(clock.elapsedTime * 2 + pos[0])
      meshRef.current.scale.setScalar(s)
    }
  })
  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  )
}

// ── Ambient particles ─────────────────────────────────────────────────────────
function Particles() {
  const particles = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i < 120; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.85 + Math.random() * 0.4
      pts.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ])
    }
    return pts
  }, [])

  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.03
  })

  return (
    <group ref={groupRef}>
      {particles.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.012, 4, 4]} />
          <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ── Main Hero Scene ───────────────────────────────────────────────────────────
export default function HeroScene() {
  // Approximate positions of major US cities on unit sphere
  const routes: Array<[[number, number, number], [number, number, number], string]> = [
    [[-1.4, 0.6, 0.9], [-1.1, 0.3, 1.4], '#60a5fa'],
    [[-1.1, 0.3, 1.4], [-0.4, -0.1, 1.8], '#4ade80'],
    [[-0.4, -0.1, 1.8], [0.9, 0.2, 1.5], '#f97316'],
    [[-1.4, 0.6, 0.9], [0.9, 0.2, 1.5], '#a78bfa'],
  ]

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#60a5fa" />
      <pointLight position={[-5, -3, -2]} intensity={0.4} color="#4ade80" />

      <Globe />
      <Particles />

      {routes.map(([from, to, color], i) => (
        <RouteArc key={i} from={from} to={to} color={color} />
      ))}

      {/* City nodes */}
      <Node pos={[-1.4, 0.6, 0.9]} color="#60a5fa" />
      <Node pos={[-1.1, 0.3, 1.4]} color="#4ade80" />
      <Node pos={[-0.4, -0.1, 1.8]} color="#f97316" />
      <Node pos={[0.9, 0.2, 1.5]} color="#a78bfa" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
      />
    </Canvas>
  )
}
