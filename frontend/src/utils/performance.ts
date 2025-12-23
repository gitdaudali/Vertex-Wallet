// Performance utilities for 3D scenes

export const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

export const checkDevicePerformance = (): 'high' | 'medium' | 'low' => {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'low'
  }

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4
  if (cores < 4) {
    return 'low'
  }

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4
  if (memory < 4) {
    return 'low'
  }

  if (cores >= 8 && memory >= 8) {
    return 'high'
  }

  return 'medium'
}

export const shouldUse3D = (): boolean => {
  try {
    // Check WebGL support first
    if (!checkWebGLSupport()) {
      return false
    }
    
    // Check device performance
    const perf = checkDevicePerformance()
    if (perf === 'low') {
      return false
    }
    
    // Additional check: try to create a WebGL context
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) {
      return false
    }
    
    // Check for WebGL context loss support
    gl.getExtension('WEBGL_debug_renderer_info')
    
    return true
  } catch (error) {
    console.warn('3D check failed, using fallback:', error)
    return false
  }
}

