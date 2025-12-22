import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { Sphere } from '@react-three/drei'

interface BlockchainNodeProps {
  position: [number, number, number]
  color: string
  speed: number
  size?: number
}

/**
 * Individual blockchain node - represents a block in the chain
 * Subtle pulsing animation to suggest data flow
 */
const BlockchainNode = ({ position, color, speed, size = 0.15 }: BlockchainNodeProps) => {
  const meshRef = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2
      
      // Subtle rotation
      meshRef.current.rotation.y += delta * speed * 0.3
      
      // Pulse effect (breathing animation)
      const pulse = 1 + Math.sin(state.clock.elapsedTime * speed * 2) * 0.1
      meshRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <Sphere ref={meshRef} position={position} args={[size, 16, 16]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.6}
        roughness={0.3}
        transparent
        opacity={0.85}
      />
    </Sphere>
  )
}

export default BlockchainNode

