import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { Sphere } from '@react-three/drei'

interface MouseInteractiveNodeProps {
  position: [number, number, number]
  color: string
  speed: number
  size?: number
  mouseInfluence?: number
}

/**
 * Blockchain node that reacts to mouse movement
 * Moves in response to cursor creating interactive depth effect
 */
const MouseInteractiveNode = ({ 
  position, 
  color, 
  speed, 
  size = 0.25,
  mouseInfluence = 0.4 
}: MouseInteractiveNodeProps) => {
  const meshRef = useRef<Mesh>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const basePositionRef = useRef(position)

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
      // Apply mouse influence - nodes move opposite to cursor (repulsion effect)
      const mouseInfluenceX = -mouseRef.current.x * mouseInfluence
      const mouseInfluenceY = -mouseRef.current.y * mouseInfluence
      
      // Smooth interpolation for mouse influence
      const targetX = basePositionRef.current[0] + mouseInfluenceX
      const targetY = basePositionRef.current[1] + mouseInfluenceY
      
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.15
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.15
      meshRef.current.position.z = basePositionRef.current[2]
      
      // Gentle floating motion (additive)
      const floatOffset = Math.sin(state.clock.elapsedTime * speed) * 0.15
      meshRef.current.position.y += floatOffset
      
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
        emissiveIntensity={0.6}
        metalness={0.5}
        roughness={0.2}
        transparent
        opacity={0.95}
      />
    </Sphere>
  )
}

export default MouseInteractiveNode
