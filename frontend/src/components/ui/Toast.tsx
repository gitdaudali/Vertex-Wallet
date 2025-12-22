import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import clsx from 'clsx'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
  duration?: number
}

const Toast = ({ message, type = 'info', onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, onClose])
  
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }
  
  const colors = {
    success: 'bg-success-light text-success border-success',
    error: 'bg-error-light text-error border-error',
    warning: 'bg-warning-light text-warning border-warning',
    info: 'bg-blue-50 text-blue-600 border-blue-200',
  }
  
  const Icon = icons[type]
  
  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-up',
        colors[type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 font-medium text-sm">{message}</p>
      <button
        onClick={onClose}
        className="shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Toast

