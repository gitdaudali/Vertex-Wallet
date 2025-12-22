import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { Box } from '@react-three/drei'

interface WireframeBlockProps {
  position: [number, number, number]
  color: string
  rotationSpeed: number
  size?: number
}

/**
 * Wireframe block representing a blockchain block
 * Slow rotation with subtle glow and mouse interaction
 */
const WireframeBlock = ({ position, color, rotationSpeed, size = 0.6 }: WireframeBlockProps) => {
  const meshRef = useRef<Mesh>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const baseRotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Mouse influence on rotation (tilt towards cursor)
      const mouseTiltX = mouseRef.current.y * 0.3
      const mouseTiltY = mouseRef.current.x * 0.3
      
      // Smooth interpolation for mouse tilt
      baseRotationRef.current.x += (mouseTiltX - baseRotationRef.current.x) * 0.1
      baseRotationRef.current.y += (mouseTiltY - baseRotationRef.current.y) * 0.1
      
      // Apply mouse tilt + base rotation
      meshRef.current.rotation.x = baseRotationRef.current.x + delta * rotationSpeed * 0.2
      meshRef.current.rotation.y = baseRotationRef.current.y + delta * rotationSpeed * 0.3
      
      // Gentle floating
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * rotationSpeed) * 0.15
      
      // Subtle position shift based on mouse
      meshRef.current.position.x = position[0] + mouseRef.current.x * 0.15
      meshRef.current.position.z = position[2] + mouseRef.current.y * 0.15
    }
  })

  return (
    <Box ref={meshRef} position={position} args={[size, size, size]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        wireframe
        transparent
        opacity={0.8}
        metalness={0.7}
        roughness={0.1}
      />
    </Box>
  )
}

export default WireframeBlock
