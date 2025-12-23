import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Vector3 } from 'three'

interface ConnectionLineProps {
  start: [number, number, number]
  end: [number, number, number]
  color: string
  opacity?: number
}

/**
 * Connection line between blockchain nodes
 * Represents the chain linking blocks together
 * Subtle animated pulse to suggest data flow
 */
const ConnectionLine = ({ start, end, color, opacity = 0.3 }: ConnectionLineProps) => {
  const lineRef = useRef<Line>(null!)
  
  // Calculate line points
  const points = useMemo(() => {
    return [
      new Vector3(...start),
      new Vector3(...end),
    ]
  }, [start, end])

  const positions = useMemo(() => {
    return new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))
  }, [points])

  useFrame((state) => {
    if (lineRef.current && lineRef.current.material) {
      // Subtle opacity pulse
      const pulse = opacity + Math.sin(state.clock.elapsedTime * 2) * 0.1
      const clampedOpacity = Math.max(0.1, Math.min(0.5, pulse))
      ;(lineRef.current.material as any).opacity = clampedOpacity
    }
  })

  return (
    <line ref={lineRef as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={Math.max(0.4, opacity)}
      />
    </line>
  )
}

export default ConnectionLine

