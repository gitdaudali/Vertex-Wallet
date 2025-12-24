import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Wallet, User, AlertCircle } from 'lucide-react'
import { authService } from '../../services/auth'
import Button from '../ui/Button'
import Input from '../ui/Input'
import PasswordInput from '../ui/PasswordInput'
import { useToast } from '../../hooks/useToast'
import ThemeToggle from '../ui/ThemeToggle'
import { logger } from '../../utils/logger'

const Register3D = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

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
      setLoading(false)
      showToast('Account created successfully!', 'success')
      navigate('/login')
    } catch (err: any) {
      logger.error('Registration error:', err)
      logger.error('Error response:', err.response)
      logger.error('Error data:', err.response?.data)
      
      let errorMessage = 'Registration failed. Please try again.'
      
      // Network errors
      if (!err.response) {
        if (err.userMessage) {
          errorMessage = err.userMessage
        } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          errorMessage = 'Cannot connect to server. Please check if backend is running.'
        } else if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Server connection refused. Backend might not be running.'
        } else {
          errorMessage = 'Network error. Please check your connection.'
        }
      } 
      // Server errors
      else if (err.response.status === 500) {
        errorMessage = 'Server error. Please try again later or check backend logs.'
      } else if (err.response.status === 404) {
        errorMessage = 'API endpoint not found. Please check backend configuration.'
      } else if (err.response.status === 0) {
        errorMessage = 'CORS error. Backend might not be configured correctly.'
      }
      // API errors
      else {
        errorMessage = err.response?.data?.detail || 
                      err.response?.data?.message || 
                      err.message || 
                      'Registration failed. Please check your information.'
      }
      
      setError(errorMessage)
      showToast(errorMessage, 'error')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-bitcoin via-orange-500 to-bitcoin-dark rounded-3xl mb-6 shadow-2xl shadow-bitcoin/30 dark:shadow-bitcoin/20">
              <Wallet className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3">
              Vertex Wallet
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              Create your account
            </p>
          </div>

          {/* Register Card */}
          <div className="
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
          ">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
              
              <div className="space-y-5">
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
              </div>

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
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-bitcoin hover:text-bitcoin-dark dark:hover:text-orange-400 transition-colors underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
            Powered by VertexAi
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register3D

