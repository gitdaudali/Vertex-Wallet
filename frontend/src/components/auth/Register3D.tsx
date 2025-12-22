import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Wallet, User, AlertCircle } from 'lucide-react'
import { authService } from '../../services/auth'
import Button from '../ui/Button'
import Input from '../ui/Input'
import PasswordInput from '../ui/PasswordInput'
import CryptoScene from '../3d/CryptoScene'
import FallbackBackground from '../3d/FallbackBackground'
import ErrorBoundary from '../3d/ErrorBoundary'
import { useToast } from '../../hooks/useToast'
import { checkWebGLSupport } from '../../utils/performance'
import ThemeToggle from '../ui/ThemeToggle'
import { logger } from '../../utils/logger'

const Register3D = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [use3D, setUse3D] = useState(true) // Enable 3D by default
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    setMounted(true)
    // Check if 3D should be enabled - be more permissive
    const check3D = () => {
      try {
        // Check WebGL support first (most important)
        const hasWebGL = checkWebGLSupport()
        logger.log('[3D] WebGL support:', hasWebGL)
        
        if (hasWebGL) {
          // If WebGL is available, enable 3D (let performance checks happen inside scene)
          setUse3D(true)
          logger.log('[3D] 3D enabled - WebGL detected')
        } else {
          setUse3D(false)
          logger.log('[3D] 3D disabled - No WebGL support')
        }
      } catch (error) {
        logger.warn('[3D] Check failed, enabling 3D anyway:', error)
        setUse3D(true) // Try anyway
      }
    }
    check3D()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      logger.log('Attempting registration with:', { name, email })
      const response = await authService.register(name, email, password)
      logger.log('Registration successful:', response)
      setLoading(false) // Stop loading state
      showToast('Account created successfully!', 'success')
      setTimeout(() => {
        navigate('/login')
      }, 800)
    } catch (err: any) {
      logger.error('Registration error:', err)
      logger.error('Error response:', err.response)
      logger.error('Error data:', err.response?.data)
      
      let errorMessage = 'Registration failed. Please try again.'
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage
      } else if (err.request) {
        // Request made but no response (network error)
        errorMessage = 'Cannot connect to server. Please check if the backend is running.'
      } else {
        // Something else happened
        errorMessage = err.message || errorMessage
      }
      
      setError(errorMessage)
      showToast(errorMessage, 'error')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* 3D Background Scene with Fallback */}
      {mounted && (
        <>
          {use3D ? (
            <ErrorBoundary 
              fallback={<FallbackBackground />}
            >
              <CryptoScene />
            </ErrorBoundary>
          ) : (
            <FallbackBackground />
          )}
        </>
      )}
      
      {/* Gradient Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40 dark:to-gray-950/60 pointer-events-none z-0" />
      
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo & Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-center mb-10"
          >
            <motion.div
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-bitcoin via-orange-500 to-bitcoin-dark rounded-3xl mb-6 shadow-2xl shadow-bitcoin/30 dark:shadow-bitcoin/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Wallet className="h-12 w-12 text-white" />
            </motion.div>
            <motion.h1
              className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Vertex Wallet
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600 dark:text-gray-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Create your account
            </motion.p>
          </motion.div>

          {/* Premium Register Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="
              relative
              backdrop-blur-2xl
              bg-white/80 dark:bg-gray-900/80
              border border-gray-200/50 dark:border-gray-700/50
              rounded-3xl
              shadow-2xl shadow-gray-900/10 dark:shadow-black/50
              p-8 md:p-10
              before:absolute before:inset-0 before:rounded-3xl
              before:bg-gradient-to-br before:from-white/50 before:to-transparent
              before:dark:from-gray-800/30
              before:pointer-events-none
              before:-z-10
            "
            whileHover={{ scale: 1.01 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-5">

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Input
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    leftIcon={<User className="h-5 w-5" />}
                    placeholder="Hasnain Haider"
                    autoComplete="name"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    leftIcon={<Mail className="h-5 w-5" />}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <PasswordInput
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    leftIcon={<Lock className="h-5 w-5" />}
                    placeholder="At least 8 characters"
                    helperText="Must be at least 8 characters long"
                    autoComplete="new-password"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <PasswordInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    leftIcon={<Lock className="h-5 w-5" />}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  fullWidth
                  size="lg"
                  className="
                    bg-gradient-to-r from-bitcoin via-orange-500 to-bitcoin-dark
                    hover:from-bitcoin-dark hover:via-orange-600 hover:to-bitcoin
                    text-white font-semibold
                    shadow-lg shadow-bitcoin/30 dark:shadow-bitcoin/20
                    hover:shadow-xl hover:shadow-bitcoin/40
                    transition-all duration-300
                    h-14 text-lg
                  "
                >
                  Create Account
                </Button>
              </motion.div>
            </form>

            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-bitcoin hover:text-bitcoin-dark dark:hover:text-orange-400 transition-colors underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            Powered by VertexAi
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register3D

