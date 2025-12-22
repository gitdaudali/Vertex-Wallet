import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Stars } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import ErrorBoundary from './ErrorBoundary'
import BlockchainNode from './BlockchainNode'
import MouseInteractiveNode from './MouseInteractiveNode'
import ConnectionLine from './ConnectionLine'
import WireframeBlock from './WireframeBlock'
import { checkDevicePerformance } from '../../utils/performance'
import { logger } from '../../utils/logger'

/**
 * Enhanced mouse parallax hook - responsive camera and scene movement
 * Creates immersive depth perception that follows cursor
 */
const MouseParallax = () => {
  const { camera } = useThree()
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      
      // Smooth target update
      targetRef.current.x = x
      targetRef.current.y = y
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(() => {
    // Smooth interpolation for camera movement
    const parallaxStrength = 0.8 // Increased for more noticeable effect
    const smoothing = 0.08 // Smooth follow speed
    
    mouseRef.current.x += (targetRef.current.x * parallaxStrength - mouseRef.current.x) * smoothing
    mouseRef.current.y += (targetRef.current.y * parallaxStrength - mouseRef.current.y) * smoothing
    
    // Apply parallax to camera position
    camera.position.x = mouseRef.current.x * 0.3
    camera.position.y = mouseRef.current.y * 0.3
    camera.position.z = 6 // Keep Z constant - closer to scene
    camera.lookAt(0, 0, 0)
  })

  return null
}

/**
 * Premium 3D Blockchain-Inspired Background Scene
 * 
 * Visual Concept: Connected blockchain nodes forming a decentralized network
 * - Floating nodes (blocks) connected by subtle lines
 * - Wireframe blocks representing blockchain structure
 * - Starfield background for depth
 * - Subtle mouse parallax for interactivity
 * 
 * Performance: Optimized for normal laptops
 * - Adaptive complexity based on device
 * - Reduced motion support
 * - FPS throttling
 */
const CryptoScene = () => {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [performance, setPerformance] = useState<'high' | 'medium' | 'low'>('medium')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    setPerformance(checkDevicePerformance())
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    logger.log('[3D] Scene initialized - Performance:', checkDevicePerformance())
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Crypto-inspired color palette (premium, trustworthy)
  const nodeColors = ['#f7931a', '#1e40af', '#10b981', '#8b5cf6'] // Bitcoin orange, blockchain blue, success green, premium purple
  const connectionColor = '#f7931a' // Bitcoin orange for connections
  const wireframeColor = '#60a5fa' // Light blue for wireframes

  // Adjust complexity based on device performance - ensure good visibility
  const nodeCount = performance === 'high' ? 10 : performance === 'medium' ? 8 : 6
  const blockCount = performance === 'high' ? 4 : performance === 'medium' ? 3 : 2

  // Generate blockchain nodes in a network pattern - closer to camera for visibility
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / nodeCount) * Math.PI * 2
    const radius = 2.0 + (i % 2) * 1.0 // Closer to camera
    const height = (Math.sin(i) * 1.0) - 0.3 // Less vertical spread
    
    return {
      position: [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      speed: 0.3 + (i % 3) * 0.2,
      color: nodeColors[i % nodeColors.length],
    }
  })

  // Generate wireframe blocks - closer to camera
  const blocks = Array.from({ length: blockCount }, (_, i) => {
    const angle = (i / blockCount) * Math.PI * 2 + Math.PI / 4
    const radius = 2.5 // Closer to camera
    
    return {
      position: [
        Math.cos(angle) * radius,
        Math.sin(i * 2) * 1.2,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      rotationSpeed: 0.2 + i * 0.1,
    }
  })

  // Generate connections between nodes (blockchain links)
  const connections = []
  for (let i = 0; i < nodes.length; i++) {
    const nextIndex = (i + 1) % nodes.length
    connections.push({
      start: nodes[i].position,
      end: nodes[nextIndex].position,
    })
  }

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true,
        }}
        style={{ width: '100%', height: '100%', display: 'block' }}
        className="w-full h-full"
        frameloop="always"
        performance={{ min: 0.5 }} // Throttle FPS if needed
        onCreated={(state) => {
          logger.log('[3D] ✅ Canvas created successfully!')
          logger.log('[3D] WebGL context:', state.gl.getContext() ? 'Available' : 'Not available')
          logger.log('[3D] Rendering', nodes.length, 'nodes,', blocks.length, 'blocks')
        }}
        onError={(error) => {
          logger.error('[3D] ❌ Canvas error:', error)
        }}
      >
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={75} />
            
            {/* Premium lighting setup */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1.0} />
            <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#f7931a" />
            <pointLight position={[0, 0, 5]} intensity={0.8} color="#60a5fa" />
            
            {/* Mouse parallax effect */}
            <MouseParallax />
            
            {/* Starfield background - subtle depth */}
            <Stars
              radius={200}
              depth={80}
              count={performance === 'high' ? 500 : performance === 'medium' ? 350 : 200}
              factor={4}
              fade
              speed={reducedMotion ? 0 : 0.5}
            />
            
            
            {/* Blockchain nodes - interactive with mouse */}
            {nodes.map((node, i) => (
              <MouseInteractiveNode
                key={`node-${i}`}
                position={node.position}
                color={node.color}
                speed={reducedMotion ? 0 : node.speed}
                mouseInfluence={0.4}
              />
            ))}
            
            {/* Connection lines between nodes */}
            {connections.map((conn, i) => (
              <ConnectionLine
                key={`conn-${i}`}
                start={conn.start}
                end={conn.end}
                color={connectionColor}
                opacity={0.25}
              />
            ))}
            
            {/* Wireframe blocks */}
            {blocks.map((block, i) => (
              <WireframeBlock
                key={`block-${i}`}
                position={block.position}
                color={wireframeColor}
                rotationSpeed={reducedMotion ? 0 : block.rotationSpeed}
              />
            ))}
          </Suspense>
        </ErrorBoundary>
      </Canvas>
      
      {/* Subtle gradient overlay for form readability - much lighter */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-gray-900/20 pointer-events-none" />
    </div>
  )
}

export default CryptoScene
