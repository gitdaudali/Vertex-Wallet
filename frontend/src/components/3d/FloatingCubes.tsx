import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { Box } from '@react-three/drei'

interface FloatingCubeProps {
  position: [number, number, number]
  speed: number
  color: string
}

const FloatingCube = ({ position, speed, color }: FloatingCubeProps) => {
  const meshRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.x += speed * delta * 0.5
      meshRef.current.rotation.y += speed * delta * 0.5
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3
      
      // Subtle scale pulse
      const scale = 1 + Math.sin(state.clock.elapsedTime * speed * 2) * 0.05
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <Box ref={meshRef} position={position} args={[0.5, 0.5, 0.5]}>
      <meshStandardMaterial
        color={color}
        metalness={0.5}
        roughness={0.3}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.9}
      />
    </Box>
  )
}

export default FloatingCube

